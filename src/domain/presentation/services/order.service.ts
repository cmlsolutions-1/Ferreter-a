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


    // public async updateOrder(dto: UpdateOrderDto): Promise<void> {
    //     if (!dto.id) throw CustomError.badRequest('ID de orden es requerido para actualizar');

    //     const session = await mongoose.startSession();
    //     session.startTransaction();

    //     try {
    //         // 1. Buscar y actualizar la orden
    //         const order = await OrderModel.findOne({ id: dto.id }).session(session);
    //         if (!order) throw CustomError.badRequest('Orden no encontrada');

    //         if (dto.subTotal !== undefined) order.subTotal = dto.subTotal;
    //         if (dto.tax !== undefined) order.tax = dto.tax;
    //         if (dto.total !== undefined) order.total = dto.total;
    //         if (dto.idClient !== undefined) order.idClient = new mongoose.Types.ObjectId(dto.idClient);
    //         if (dto.idSalesPerson !== undefined) order.idSalesPerson = new mongoose.Types.ObjectId(dto.idSalesPerson);
    //         if (dto.updatedDate) order.updatedDate = dto.updatedDate;

    //         await order.save({ session });
    //         if (dto.items && dto.items.length > 0) {
    //             for (const item of dto.items) {
    //                 const orderItem = await OrderItemModel.findOne({ id: item.id }).session(session);
    //                 if (!orderItem) {
    //                     throw CustomError.internalServer(`Item con id ${item.id} no encontrado`);
    //                 }

    //                 if (item.quantity !== undefined) orderItem.quantity = item.quantity;
    //                 if (item.price !== undefined) orderItem.price = item.price;
    //                 if (item.idProduct !== undefined) orderItem.idProduct = new mongoose.Types.ObjectId(item.idProduct);

    //                 await orderItem.save({ session });
    //             }
    //         }

    //         await session.commitTransaction();
    //     } catch (error) {
    //         await session.abortTransaction();
    //         throw CustomError.internalServer('Error al actualizar la orden ${error}');
    //     } finally {
    //         session.endSession();
    //     }
    // }

    public async setOrderAsPaid(dto: UpdateOrderPaidDto): Promise<void> {
        const order = await OrderModel.findOne({ _id: dto._id });
        if (!order) throw CustomError.notFound('Orden no encontrada');

        order.isPaid = true;
        order.paymendDate = new Date();
        order.updatedDate = new Date();

        await order.save();
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

        // Traer todos los ids de órdenes
        const orderIds = orders.map(o => o._id);

        const items = await OrderItemModel.find({ idOrder: { $in: orderIds } })
            .populate("idProduct", "reference description")
            .lean();

        // Mapear cada orden con sus items
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

    private generateEmailTemplate = (
        orderData: any,
        clientName: string,
        clientIdToShow: string,
        salesPersonName: string
    ): string => {
        const itemsInOrder = orderData.items?.length || 0;
        const subTotal = orderData.subTotal || 0;
        const tax = orderData.tax || 0;
        const total = orderData.total || 0;

        return `
  <div style="max-width:800px; margin:auto; padding:20px; border:1px solid #ccc; font-family:Arial, sans-serif; font-size:14px;">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="color:#333; margin:0;">ORDEN DE PEDIDO</h2>
      <h3 style="color:#666; margin:5px 0;">#${orderData._id?.toString().slice(-6) || 'N/A'}</h3>
      <hr style="margin:15px 0; border:none; border-top:1px solid #ddd;">
    </div>

    <!-- Order Info -->
    <div style="margin-bottom:20px;">
      <h4 style="color:#333; margin:0 0 10px 0;">Información del Pedido</h4>
      <div style="width:100%; display:flex; justify-content:space-between;">
        <div style="width:48%;">
          <p><strong>Fecha de Creación:</strong> ${orderData.createdDate ? new Date(orderData.createdDate).toLocaleDateString('es-CO') : 'N/A'}</p>
          <p><strong>Estado:</strong> <span style="color:${orderData.isPaid ? '#22c55e' : '#ef4444'}; font-weight:bold;">
            ${orderData.isPaid ? 'Gestionada' : 'No Gestionada'}
          </span></p>
          <p><strong>Vendedor:</strong> ${salesPersonName}</p>
        </div>
        <div style="width:48%;">
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>ID Cliente:</strong> ${clientIdToShow}</p>
        </div>
      </div>
    </div>

    <!-- Shipping Address -->
    ${orderData.OrderAddress
                ? `
    <div style="margin-bottom:20px;">
      <h4 style="color:#333; margin:0 0 10px 0;">Dirección de Envío</h4>
      <div style="background:#f8f9fa; padding:10px; border-radius:4px;">
        <p style="margin:2px 0;"><strong>Nombre:</strong> ${clientName}</p>
        <p style="margin:2px 0;"><strong>Dirección:</strong> ${orderData.OrderAddress.address || 'N/A'}</p>
        <p style="margin:2px 0;"><strong>Ciudad:</strong> ${orderData.OrderAddress.city || 'N/A'}</p>
        <p style="margin:2px 0;"><strong>Código Postal:</strong> ${orderData.OrderAddress.postalCode || 'N/A'}</p>
        <p style="margin:2px 0;"><strong>Teléfono:</strong> ${orderData.OrderAddress.phone || 'N/A'}</p>
      </div>
    </div>
    `
                : ''
            }

    <!-- Items -->
    <div style="margin:20px 0;">
      <h4 style="color:#333; margin:0 0 10px 0;">Productos</h4>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="border:1px solid #ddd; padding:10px; text-align:left;">Producto</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:center;">Referencia</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:center;">Cantidad</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:right;">Precio Unit.</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items?.map((item: any) => {
                const productName =
                    item.idProduct?.description ||
                    item.idProduct?.detalle ||
                    item.idProduct?.title ||
                    'Producto sin nombre';
                const reference = item.idProduct?.reference || 'N/A';
                const unitPrice = item.price / (item.quantity || 1);
                const quantity = item.quantity || 0;
                const subtotal = item.price;

                return `
              <tr>
                <td style="border:1px solid #ddd; padding:8px;">
                  <div><strong>${productName}</strong></div>
                  <div style="font-size:12px; color:#666;">ID: ${item.idProduct?._id?.toString().slice(-6) || 'N/A'
                    }</div>
                </td>
                <td style="border:1px solid #ddd; padding:8px; text-align:center;">${reference}</td>
                <td style="border:1px solid #ddd; padding:8px; text-align:center;">${quantity}</td>
                <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${unitPrice.toLocaleString(
                        'es-CO'
                    )}</td>
                <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${subtotal.toLocaleString(
                        'es-CO'
                    )}</td>
              </tr>
              `;
            }).join('') ||
            `
            <tr>
              <td colspan="5" style="border:1px solid #ddd; padding:20px; text-align:center; color:#666;">
                No hay productos en esta orden
              </td>
            </tr>
          `
            }
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="margin-top:20px; text-align:right;">
      <table style="width:300px; margin-left:auto; border-collapse:collapse;">
        <tr>
          <td style="padding:5px; text-align:right;"><strong>No. Productos:</strong></td>
          <td style="padding:5px; text-align:right;">${itemsInOrder === 1 ? '1 artículo' : `${itemsInOrder} artículos`}</td>
        </tr>
        <tr>
          <td style="padding:5px; text-align:right;"><strong>Subtotal:</strong></td>
          <td style="padding:5px; text-align:right;">$${subTotal.toLocaleString('es-CO')}</td>
        </tr>
        <tr>
          <td style="padding:5px; text-align:right;"><strong>Impuestos (15%):</strong></td>
          <td style="padding:5px; text-align:right;">$${tax.toLocaleString('es-CO')}</td>
        </tr>
        <tr style="background:#f8f9fa;">
          <td style="padding:10px; text-align:right;"><strong style="font-size:16px;">Total:</strong></td>
          <td style="padding:10px; text-align:right;"><strong style="font-size:16px;">$${total.toLocaleString('es-CO')}</strong></td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="margin-top:30px; text-align:center; color:#666; font-size:12px;">
      <p>Gracias por su compra</p>
      <p style="margin-top:5px;">Este correo es generado automáticamente</p>
    </div>

  </div>
  `;
};

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

        console.log('Client Email:', clientEmail);
        const html = this.generateEmailTemplate(orderData, clientName, clientIdToShow, salesPersonName);
        console.log('Aqui');

        this.sendEmail(clientEmail, html);
        this.sendEmail(salesPersonEmail, html);
    }

    private sendEmail = async (email: string, html:string) => {

        const options = {
            to: email,
            subject: 'Orden Creada',
            htmlBody: html,
        }
        const isSent = await this.emailService.sendEmail(options);
        console.log('Email sent status:', isSent);
        if (!isSent) throw CustomError.internalServer('Error sending email');
        return true;
    }
}




