import { OrderItemDto } from "./creater-order-item.dto";

export class CreateOrderDto {
  private constructor(
    public idClient: string,
    public syscafeOrder: string,
    public orderItems: OrderItemDto[],
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateOrderDto?] {
    const { idClient, syscafeOrder, orderItems } = object;

    if (!idClient) return ['El campo "idClient" es requerido'];
    if (!syscafeOrder) return ['El campo "syscafeeOrder" es requerido'];
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) return ['La lista de productos es requerida'];

    const items: OrderItemDto[] = [];
    for (const item of orderItems) {
      const [error, orderItemDto] = OrderItemDto.create(item);
      if (error) return [error];
      items.push(orderItemDto!);
    }

    return [undefined, new CreateOrderDto(idClient,syscafeOrder, items, )];
  }
}
