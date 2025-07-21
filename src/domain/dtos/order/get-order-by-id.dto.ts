

export class GetOrderByIdDto {
  constructor(
    public id: string,
    public subTotal: number,
    public tax: number,
    public total: string,
    public isPaid: boolean,
    public paymendDate: Date | null,
    public createdDate: Date,
    public updatedDate: Date | null,
    public idClient: string,
    public idSalesPerson: string,
    public items: OrderItemDto[]
  ) {}

  static fromModel(order: any, items: any[]): GetOrderByIdDto {
    return new GetOrderByIdDto(
      order.id,
      order.subTotal,
      order.tax,
      order.total,
      order.isPaid,
      order.paymendDate ?? null,
      order.createdDate,
      order.updatedDate ?? null,
      order.idClient.toString(),
      order.idSalesPerson.toString(),
      OrderItemDto.fromModelArray(items)
    );
  }
}

class OrderItemDto {
  constructor(
    public id: string,
    public quantity: number,
    public price: number,
    public idProduct: string
  ) {}

  static fromModel(item: any): OrderItemDto {
    return new OrderItemDto(
      item.id,
      item.quantity,
      item.price,
      item.idProduct.toString()
    );
  }

  static fromModelArray(items: any[]): OrderItemDto[] {
    return items.map(item => this.fromModel(item));
  }
}
