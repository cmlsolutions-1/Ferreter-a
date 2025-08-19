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


export class OrderService {

    public constructor(
        private readonly userService: UserService,
        private readonly productService: ProductService,
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

        const order = await OrderModel.findOne({ idSalesPerson })
            .populate('idClient', 'name lastName id')
            .lean();
        if (!order) throw CustomError.notFound('Este vendedor no tiene ordenes');

        const items = await OrderItemModel.find({ idOrder: order._id })
            .populate('idProduct', 'reference description')
            .lean();

        const dto = GetOrderBySalesPersonDto.fromModel(order, items);
        return dto;
    }

    public async getOrderByClient(idClient: string): Promise<any> {

        const order = await OrderModel.findOne({ idClient })

        if (!order) throw CustomError.notFound('Este cliente no tiene ordenes');

        const items = await OrderItemModel.find({ idOrder: order._id })
            .populate('idProduct', 'reference description')
            .lean();

        const dto = GetOrderByClientDto.fromModel(order, items);
        return dto;
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
}
