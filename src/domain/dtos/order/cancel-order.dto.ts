export class CancelOrderDto {
  private constructor(
    public _id: string,
    public reasonCancellation: string,
  ) {}

  static update(data: { [key: string]: any }): [string?, CancelOrderDto?] {
    const { _id , reasonCancellation } = data;

    if (!_id) return ['El campo "id" es obligatorio'];

    if (!reasonCancellation) return ['El campo "reasonCancellation" es obligatorio'];

    return [undefined, new CancelOrderDto(_id, reasonCancellation)];
  }
}
