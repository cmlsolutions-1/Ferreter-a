export class UpdateOrderPaidDto {
  private constructor(
    public id: string,
    public isPaid: boolean,
    public paymentDate?: Date
  ) {}

  static update(data: { [key: string]: any }): [string?, UpdateOrderPaidDto?] {
    const { id, isPaid, paymentDate } = data;

    if (!id) return ['El campo "id" es obligatorio'];
    if (typeof isPaid !== 'boolean') return ['El campo "isPaid" debe ser de tipo booleano'];

    return [undefined, new UpdateOrderPaidDto(id, isPaid, paymentDate)];
  }
}
