export class UpdateOrderPaidDto {
  private constructor(
    public _id: string,
    public syscafeOrder: string,
  ) {}

  static update(data: { [key: string]: any }): [string?, UpdateOrderPaidDto?] {
    const { _id , syscafeOrder } = data;

    if (!_id) return ['El campo "id" es obligatorio'];

    if (!syscafeOrder) return ['El campo "syscafeOrder" es obligatorio'];
    // if (typeof isPaid !== 'boolean') return ['El campo "isPaid" debe ser de tipo booleano'];

    return [undefined, new UpdateOrderPaidDto(_id, syscafeOrder)];
  }
}
