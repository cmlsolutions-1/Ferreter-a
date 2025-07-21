export class CreateContainerDto {
  private constructor(
    public id: string,
    public name: string,
    public date?: Date,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateContainerDto?] {
    const { id, name, date } = object;

    if (!id) return ['El campo "id" es obligatorio'];
    if (!name) return ['El campo "name" es obligatorio'];

    let parsedDate: Date | undefined;

    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return ['El campo "date" no es una fecha válida'];
    }

    return [undefined, new CreateContainerDto(id, name, parsedDate)];
  }
}
