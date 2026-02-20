

export class GetOrderBySalesPersonDto {
  constructor(
    public _id: string,
    public subTotal: number,
    public tax: number,
    public total: string,
    public isPaid: boolean,
    public syscafeOrder: string,
    public paymendDate: Date | null,
    public createdDate: Date,
    public Client: any,
    public items: OrderItemDto[],
    public offers?: any[],
    public orderNumber?: string,
    public addres?: string,
    public isCanceled? : boolean,
    public reasonCancellation? : string
  ) {}

  static fromModel(order: any, items: any[]): GetOrderBySalesPersonDto {
    return new GetOrderBySalesPersonDto(
      order._id,
      order.subTotal,
      order.tax,
      order.total,
      order.isPaid,
      order.syscafeOrder,
      order.paymendDate ?? null,
      order.createdDate,
      order.idClient,
      OrderItemDto.fromModelArray(items),
      order.offers ?? [],
      order.orderNumber ?? "Sin consecutivo",
      order.addres ?? "",
      order.isCanceled,
      order.reasonCancellation
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
