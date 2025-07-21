export class OrderItemDto {
  constructor(
    public id: string,
    public quantity: number,
    public price: number,
    public idProduct: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, OrderItemDto?] {
    const { id, quantity, price, idProduct } = object;

    if (!id) return ['El campo "id" es requerido'];
    if (!quantity || quantity <= 0) return ['El campo "quantity" es requerido y debe ser mayor que 0'];
    if (!price || price <= 0) return ['El campo "price" es requerido y debe ser mayor que 0'];
    if (!idProduct) return ['El campo "idProduct" es requerido'];

    return [undefined, new OrderItemDto(id, quantity, price, idProduct)];
  }
}
