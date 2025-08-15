export class OrderItemDto {
  constructor(
    public quantity: number,
    public idProduct: string,
    public price?: number,
  ) {}

  static create(object: { [key: string]: any }): [string?, OrderItemDto?] {
    const { quantity, idProduct } = object;

    if (!quantity || quantity <= 0) return ['El campo "quantity" es requerido y debe ser mayor que 0'];
    if (!idProduct) return ['El campo "idProduct" es requerido'];

    return [undefined, new OrderItemDto( quantity, idProduct)];
  }
}
