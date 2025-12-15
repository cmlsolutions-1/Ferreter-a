

export class GetOrderByIdDto {
  constructor(
    public _id: string,
    public subTotal: number,
    public tax: number,
    public total: string,
    public isPaid: boolean,
    public syscafeOrder: string,
    public paymendDate: Date | null,
    public createdDate: Date,
    public items: OrderItemDto[],
    public offers?: any[],
    public orderNumber?: string
  ) {}

  static fromModel(order: any, items: any[]): GetOrderByIdDto {
    return new GetOrderByIdDto(
      order._id,
      order.subTotal,
      order.tax,
      order.total,
      order.isPaid,
      order.syscafeOrder,
      order.paymendDate ?? null,
      order.createdDate,
      OrderItemDto.fromModelArray(items), 
      order.offers ?? [],
      order.orderNumber ?? "Sin consecutivo"
    );
  }
}

class OrderItemDto {
  constructor(
    public id: string,
    public price: number,
    public quantity: number,
    public Product: any
  ) {}

  static fromModel(item: any): OrderItemDto {
    return new OrderItemDto(
      item.id,
      item.price,
      item.quantity,
      item.idProduct
    );
  }

  static fromModelArray(items: any[]): OrderItemDto[] {
    return items.map(item => this.fromModel(item));
  }
}
