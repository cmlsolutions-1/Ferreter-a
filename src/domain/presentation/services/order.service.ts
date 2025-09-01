import { CreateOrderDto } from '../../dtos/order/create-order.dto';
import { OrderModel } from '../../../data/mongo/models/order.model';
import { OrderItemModel } from '../../../data/mongo/models/orderItem.model'; // Asegúrate de exportar correctamente
import { CustomError } from '../../errors/custom.errors';
import { UpdateOrderDto } from '../../dtos/order/update-order.dto';
import { UpdateOrderPaidDto } from '../../dtos/order/Update-order-paid.dto';
import mongoose from 'mongoose';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { GetOrderBySalesPersonDto } from '../../dtos/order/get-order-by-salesPerson.dto';
import { GetOrderByClientDto } from '../../dtos/order/get-order-by-client.dto';
import { GetOrderByIdDto } from '../../dtos/order/get-order-by-id.dto';
import { EmailService } from './email.service';
import { generateOrderEmailTemplate } from '../order/templates/order-email.template';


export class OrderService {

  public constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly emailService: EmailService,
  ) {
  }

  public async createOrder(dto: CreateOrderDto): Promise<void> {
    const priceCategoryId = await this.userService.getPriceCategoryIdByClientId(dto.idClient);
    const { subTotal, tax, total } = await this.getMoneyValues(priceCategoryId!, dto.orderItems);
    const idSalesPerson = await this.userService.getSalesPersonIdByClientId(dto.idClient);

    try {
      const order = await OrderModel.create({
        subTotal,
        tax,
        total,
        isPaid: false,
        createdDate: new Date(),
        idClient: dto.idClient,
        idSalesPerson: idSalesPerson,
      });

      const orderItemDocs = dto.orderItems.map(item => ({
        quantity: item.quantity,
        price: item.price,
        idProduct: item.idProduct,
        idOrder: order._id
      }));

      await OrderItemModel.insertMany(orderItemDocs);

      await this.processAndSendOrderEmail(order._id.toString());

    } catch (error) {
      throw CustomError.internalServer(`Error al crear la orden: ${error}`);
    }
  }


  private async getMoneyValues(priceCategoryId: string, orderItems: any[]): Promise<{ subTotal: number, tax: number, total: string }> {
    let subTotal = 0;
    let tax = 0;
    let total = 0;
    for (const item of orderItems) {
      const prices = await this.productService.getPriceByCategory(item.idProduct, priceCategoryId);
      if (!prices) throw CustomError.notFound('No se encontraron precios para el producto');
      total += prices * item.quantity;
      tax += prices * item.quantity * 0.19;
      subTotal += (total - tax);
      item.price = prices;
    }
    return {
      subTotal,
      tax,
      total: (subTotal + tax).toFixed(2),
    };
  }
  public async setOrderAsPaid(dto: UpdateOrderPaidDto): Promise<void> {
    
    const populatedOrder = await OrderModel.findOne({ _id: dto._id })
      .populate('idClient', 'name lastName email')
      .populate('idSalesPerson', 'name lastName email')

    if (!populatedOrder) throw CustomError.notFound('Orden no encontrada');

    const items = await OrderItemModel.find({ idOrder: dto._id })
      .populate('idProduct', 'title description reference')
      .lean() as any;

    const client = populatedOrder.idClient as any;
    const clientEmail =
      client?.email?.find((e: any) => e.IsPrincipal)?.EmailAddres ||
      client?.email?.[0]?.EmailAddres ||
      null;
    populatedOrder.isPaid = true;
    populatedOrder.paymendDate = new Date();
    populatedOrder.updatedDate = new Date();

    await populatedOrder.save();

    const orderData = {
      ...populatedOrder.toJSON(),
      items
    };

    const clientName = `${client.name ?? ''} ${client.lastName ?? ''}`.trim();
    const clientIdToShow = populatedOrder?.idClient?._id?.toString().slice(-6) || 'N/A';
    const salesPersonName = `${client.name ?? ''} ${client.lastName ?? ''}`.trim();
    const html = generateOrderEmailTemplate(orderData, clientName, clientIdToShow, salesPersonName);

    await this.sendEmail(clientEmail, html, "Orden Gestionada");

  }

  public async getOrderBySalesPerson(idSalesPerson: string): Promise<any> {

    const orders = await OrderModel.find({ idSalesPerson })
      .populate('idClient', 'name lastName id')
      .lean();
    if (!orders) throw CustomError.notFound('Este vendedor no tiene ordenes');

    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItemModel.find({ idOrder: order._id })
          .populate('idProduct', 'reference description')
          .lean();

        return GetOrderBySalesPersonDto.fromModel(order, items);
      })
    );

    return result;
  }

  public async getOrderByClient(idClient: string): Promise<any> {

    const orders = await OrderModel.find({ idClient })

    if (!orders) throw CustomError.notFound('Este cliente no tiene ordenes');

    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItemModel.find({ idOrder: order._id })
          .populate('idProduct', 'reference description')
          .lean();

        return GetOrderByClientDto.fromModel(order, items);
      })
    );

    return result;
  }

  public async getAllOrder(): Promise<any> {

    const orders = await OrderModel.find().lean();

    if (!orders.length) throw CustomError.notFound("Este cliente no tiene órdenes");

    const orderIds = orders.map(o => o._id);

    const items = await OrderItemModel.find({ idOrder: { $in: orderIds } })
      .populate("idProduct", "reference description")
      .lean();

    const result = orders.map(order => ({
      ...order,
      items: items.filter(i => i.idOrder.toString() === order._id.toString())
    }));

    return result;
  }

  public async getOrderById(id: string): Promise<any> {

    const order = await OrderModel.findById(id);

    if (!order) throw CustomError.notFound('Esta orden no fue encontrada');

    const items = await OrderItemModel.find({ idOrder: order._id })
      .populate('idProduct', 'reference description')
      .lean();

    const dto = GetOrderByIdDto.fromModel(order, items);
    return dto;
  }

  private async processAndSendOrderEmail(orderId: string): Promise<void> {
    const populatedOrder = await OrderModel.findById(orderId)
      .populate('idClient', 'name lastName email')
      .populate('idSalesPerson', 'name lastName email')
      .lean() as any;

    if (!populatedOrder) {
      throw new Error(`Order ${orderId} not found`);
    }
    const items = await OrderItemModel.find({ idOrder: orderId })
      .populate('idProduct', 'title description reference')
      .lean() as any;

    const clientEmail =
      populatedOrder?.idClient?.email?.find((e: any) => e.IsPrincipal)?.EmailAddres ||
      populatedOrder?.idClient?.email?.[0]?.EmailAddres ||
      null;

    const salesPersonEmail =
      populatedOrder?.idSalesPerson?.email?.find((e: any) => e.IsPrincipal)?.EmailAddres ||
      populatedOrder?.idSalesPerson?.email?.[0]?.EmailAddres ||
      null;

    const orderData = {
      ...populatedOrder,
      items
    };
    const clientName = `${populatedOrder?.idClient?.name ?? ''} ${populatedOrder?.idClient?.lastName ?? ''}`.trim();
    const clientIdToShow = populatedOrder?.idClient?._id?.toString().slice(-6) || 'N/A';
    const salesPersonName = `${populatedOrder?.idSalesPerson?.name ?? ''} ${populatedOrder?.idSalesPerson?.lastName ?? ''}`.trim();
    const html = generateOrderEmailTemplate(orderData, clientName, clientIdToShow, salesPersonName);

    await this.sendEmail(clientEmail, html, "Orden Creada");
    await this.sendEmail(salesPersonEmail, html, "Orden Creada");
  }

  private sendEmail = async (email: string, html: string, subject: string) => {
    const options = {
      to: email,
      subject,
      htmlBody: html,
    }
    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer('Error sending email');
    return true;
  }
}




