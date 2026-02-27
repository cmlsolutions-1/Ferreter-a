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
import { OfferService } from './offer.service';
import { CancelOrderDto } from '../../dtos/order/cancel-order.dto';
import { ProductModel } from '../../../data/mongo/models/product.model';


export class OrderService {

  public constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly emailService: EmailService,
    private readonly offerService: OfferService,
  ) {
  }

  public async createOrder(dto: CreateOrderDto): Promise<void> {
    const priceCategoryId = await this.userService.getPriceCategoryIdByClientId(dto.idClient);
    const { subTotal, tax, total, discounts, offers } = await this.getMoneyValues(priceCategoryId!, dto.orderItems);
    const idSalesPerson = await this.userService.getSalesPersonIdByClientId(dto.idClient);

    try {

      await this.validatePlatformStock(dto.orderItems);

      const order = await OrderModel.create({
        subTotal,
        tax,
        total,
        discounts,
        isPaid: false,
        createdDate: new Date(),
        idClient: dto.idClient,
        idSalesPerson: idSalesPerson,
        offers,
        addres: dto.addres,
        isCanceled: false,
        reasonCancellation: ""
      });

      const orderItemDocs = dto.orderItems.map(item => ({
        quantity: item.quantity,
        price: item.price,
        idProduct: item.idProduct,
        idOrder: order._id
      }));

      await OrderItemModel.insertMany(orderItemDocs);

      await this.productService.discountPlatformStock(dto.orderItems);

      await this.processAndSendOrderEmail(order._id.toString());

    } catch (error) {

      throw CustomError.internalServer(`Error al crear la orden: ${error}`);
    }
  }

  async validatePlatformStock(orderItems: { idProduct: string; quantity: number }[]) {
 
    const grouped = new Map<string, number>();
    for (const it of orderItems) {
      grouped.set(it.idProduct, (grouped.get(it.idProduct) ?? 0) + it.quantity);
    }

    const ids = Array.from(grouped.keys());
    const products = await ProductModel.find({ _id: { $in: ids } })
      .select("description platformStock")
      .lean();

    const byId = new Map(products.map(p => [p._id.toString(), p]));

    for (const [idProduct, qty] of grouped.entries()) {
      const p: any = byId.get(idProduct);
      if (!p) throw CustomError.notFound("Producto no encontrado");

      if ((p.platformStock ?? 0) < qty) {
        throw CustomError.badRequest(
          `Stock insuficiente para "${p.description}". Disponible: ${p.platformStock}, solicitado: ${qty}`
        );
      }
    }
  }


  private async getMoneyValues(priceCategoryId: string, orderItems: any[]): Promise<{ subTotal: number, tax: number, total: number, discounts: number, offers: any[] }> {
    let acumTax = 0;
    let acumSubTotal = 0;
    let acumTotal = 0;
    let subTotal = 0;
    let tax = 0;
    let total = 0;
    let discounts = 0;
    let offers = [];
    let baseByUnit = 0;
    let taxByUnit = 0;

    for (const item of orderItems) {
      const prices = await this.productService.getPriceByCategory(item.idProduct, priceCategoryId);
      item.price = prices;
      if (!prices) throw CustomError.notFound('No se encontraron precios para el producto');
      let offer = await this.offerService.validateOffersForOrder(item.idProduct, item.quantity);

      baseByUnit = prices / 1.19;
      taxByUnit = prices - baseByUnit;

      let discounsByItem = 0;
      if (offer) {
        discounsByItem = ((baseByUnit * offer.percentage) / 100) * item.quantity;
        discounts += (+discounsByItem.toFixed(2));
        offers.push({
          ...offer,
          product: item.idProduct
        });

        subTotal = (baseByUnit * item.quantity) - discounsByItem;
        tax = subTotal * 0.19;
        total = (subTotal + tax);
      }
      else {

        subTotal = baseByUnit * item.quantity;
        tax = taxByUnit * item.quantity;
        total = (subTotal + tax - discounsByItem);
      }

      acumTax += tax;
      acumSubTotal += subTotal;
      acumTotal += total;

    }
    return {
      subTotal: +acumSubTotal.toFixed(2),
      tax: +acumTax.toFixed(2),
      total: +acumTotal.toFixed(2),
      discounts,
      offers
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
    populatedOrder.syscafeOrder = dto.syscafeOrder;
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

  public async setOrderAsCanceled(dto: CancelOrderDto): Promise<boolean> {

    const populatedOrder = await OrderModel.findOne({ _id: dto._id })

    if (!populatedOrder) throw CustomError.notFound('Orden no encontrada');

    const items = await OrderItemModel.find({ idOrder: dto._id })
      .populate('idProduct', 'title description reference platformStock')
      .lean() as any;

    for (const item of items) {

      const quantity = item.quantity;

      if (item.idProduct?._id) {
        await ProductModel.findByIdAndUpdate(
          item.idProduct._id,
          {
            $inc: { platformStock: quantity }
          }
        );
      }
    }


    populatedOrder.isCanceled = true;
    populatedOrder.reasonCancellation = dto.reasonCancellation;
    await populatedOrder.save();
    return true;

  }

  public async getOrderBySalesPerson(idSalesPerson: string): Promise<any> {

    const orders = await OrderModel.find({ idSalesPerson })
      .populate('idClient', 'name lastName id')
      .populate('offers.product', 'reference description')
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
      .populate('offers.product', 'reference description')
      .lean();

    if (!orders) throw CustomError.notFound('Este cliente no tiene ordenes');

    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItemModel.find({ idOrder: order._id })
          .populate({
            path: 'idProduct',
            select: 'reference description image',
            populate: {
              path: 'image'
            }
          })
          .lean();

        return GetOrderByClientDto.fromModel(order, items);
      })
    );
    return result;
  }

  public async getAllOrder(): Promise<any> {

    const orders = await OrderModel.find()
      .populate('offers.product', 'reference description')
      .lean();

    if (!orders.length) throw CustomError.notFound("Este cliente no tiene órdenes");

    const orderIds = orders.map(o => o._id);

    const items = await OrderItemModel.find({ idOrder: { $in: orderIds } })
      .populate({
        path: 'idProduct',
        select: 'reference description image',
        populate: {
          path: 'image'
        }
      })
      .lean();

    const result = orders.map(order => ({
      ...order,
      orderNumber: order.orderNumber ?? "Sin consecutivo",
      items: items.filter(i => i.idOrder.toString() === order._id.toString())
    }));

    return result;
  }

  public async getOrderById(id: string): Promise<any> {

    const order = await OrderModel.findById(id)
      .populate('offers.product', 'reference description')
      .lean();

    if (!order) throw CustomError.notFound('Esta orden no fue encontrada');

    const items = await OrderItemModel.find({ idOrder: order._id })
      .populate({
        path: 'idProduct',
        select: 'reference description image',
        populate: {
          path: 'image'
        }
      })

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




