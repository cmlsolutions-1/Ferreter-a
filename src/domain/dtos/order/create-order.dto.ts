// import { OrderItemDto } from './OrderItemDto';
import { OrderItemDto } from "./creater-order-item.dto";

export class CreateOrderDto {
  private constructor(
    public id: string,
    public subTotal: number,
    public tax: number,
    public total: string,
    public idClient: string,
    public idSalesPerson: string,
    public orderItems: OrderItemDto[],
    public paymendDate?: Date,
    public isPaid?: boolean
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateOrderDto?] {
    const { id, subTotal, tax, total, idClient, idSalesPerson, orderItems, paymendDate } = object;

    if (!id) return ['El campo "id" es requerido'];
    if (typeof subTotal !== 'number' || subTotal < 0) return ['El campo "subTotal" es requerido y debe ser un número'];
    if (typeof tax !== 'number' || tax < 0) return ['El campo "tax" es requerido y debe ser un número'];
    if (!total) return ['El campo "total" es requerido'];
    if (!idClient) return ['El campo "idClient" es requerido'];
    if (!idSalesPerson) return ['El campo "idSalesPerson" es requerido'];
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) return ['La lista de productos es requerida'];

    const items: OrderItemDto[] = [];
    for (const item of orderItems) {
      const [error, orderItemDto] = OrderItemDto.create(item);
      if (error) return [error];
      items.push(orderItemDto!);
    }

    let parsedPaymendDate: Date | undefined;
    if (paymendDate) {
      parsedPaymendDate = new Date(paymendDate);
      if (isNaN(parsedPaymendDate.getTime())) return ['El campo "paymendDate" no es una fecha válida'];
    }

    return [undefined, new CreateOrderDto(id, subTotal, tax, total, idClient, idSalesPerson, items, parsedPaymendDate, false)];
  }
}
