export class UpdateOrderPaidDto {
  private constructor(
    public _id: string,
  ) {}

  static update(data: { [key: string]: any }): [string?, UpdateOrderPaidDto?] {
    const { _id, isPaid, paymentDate } = data;

    if (!_id) return ['El campo "id" es obligatorio'];
    // if (typeof isPaid !== 'boolean') return ['El campo "isPaid" debe ser de tipo booleano'];

    return [undefined, new UpdateOrderPaidDto(_id)];
  }
}
