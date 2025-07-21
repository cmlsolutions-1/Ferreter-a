import { CreateOrderDto } from '../../dtos/order/create-order.dto';
import { OrderModel } from '../../../data/mongo/models/order.model';
import { OrderItemModel } from '../../../data/mongo/models/orderItem.model'; // Asegúrate de exportar correctamente
import { CustomError } from '../../errors/custom.errors';
import { UpdateOrderDto } from '../../dtos/order/update-order.dto';
import { UpdateOrderPaidDto } from '../../dtos/order/Update-order-paid.dto';
import mongoose from 'mongoose';
import { GetOrderByIdDto } from '../../dtos/order/get-order-by-id.dto';

export class OrderService {
    
    public async createOrder(dto: CreateOrderDto): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            await OrderModel.create([{
                id: dto.id,
                subTotal: dto.subTotal,
                tax: dto.tax,
                total: dto.total,
                isPaid: dto.isPaid ?? false,
                paymendDate: dto.paymendDate,
                createdDate: new Date(),
                idClient: dto.idClient,
                idSalesPerson: dto.idSalesPerson,
            }], { session });


            const orderItemDocs = dto.orderItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                idProduct: item.idProduct,
                idOrder: dto.id,
            }));

            await OrderItemModel.insertMany(orderItemDocs, { session });


            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw CustomError.internalServer(`Error al crear la oferta: ${error}`);
        } finally {
            session.endSession();
        }
    }

    public async updateOrder(dto: UpdateOrderDto): Promise<void> {
        if (!dto.id) throw CustomError.badRequest('ID de orden es requerido para actualizar');

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Buscar y actualizar la orden
            const order = await OrderModel.findOne({ id: dto.id }).session(session);
            if (!order) throw CustomError.badRequest('Orden no encontrada');

            if (dto.subTotal !== undefined) order.subTotal = dto.subTotal;
            if (dto.tax !== undefined) order.tax = dto.tax;
            if (dto.total !== undefined) order.total = dto.total;
            if (dto.idClient !== undefined) order.idClient = new mongoose.Types.ObjectId(dto.idClient);
            if (dto.idSalesPerson !== undefined) order.idSalesPerson = new mongoose.Types.ObjectId(dto.idSalesPerson);
            if (dto.updatedDate) order.updatedDate = dto.updatedDate;

            await order.save({ session });
            if (dto.items && dto.items.length > 0) {
                for (const item of dto.items) {
                    const orderItem = await OrderItemModel.findOne({ id: item.id }).session(session);
                    if (!orderItem) {
                        throw CustomError.internalServer(`Item con id ${item.id} no encontrado`);
                    }

                    if (item.quantity !== undefined) orderItem.quantity = item.quantity;
                    if (item.price !== undefined) orderItem.price = item.price;
                    if (item.idProduct !== undefined) orderItem.idProduct = new mongoose.Types.ObjectId(item.idProduct);

                    await orderItem.save({ session });
                }
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw CustomError.internalServer('Error al actualizar la orden ${error}');
        } finally {
            session.endSession();
        }
    }

    public async setOrderAsPaid(dto: UpdateOrderPaidDto): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await OrderModel.findOne({ id: dto.id }).session(session);
            if (!order) throw CustomError.notFound('Orden no encontrada');

            order.isPaid = dto.isPaid;
            order.paymendDate = dto.paymentDate ?? new Date();
            order.updatedDate = new Date();

            await order.save({ session });

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw CustomError.internalServer('Error al marcar la orden como pagada ${error}');
        } finally {
            session.endSession();
        }
    }

    public async getOrderById(id: string): Promise<any> {

        const order = await OrderModel.findOne({ id }).lean();
        if (!order) throw CustomError.notFound('Order not found');

        const items = await OrderItemModel.find({ idOrder: order._id }).lean();

        const dto = GetOrderByIdDto.fromModel(order, items);
        return dto;
    }
}
