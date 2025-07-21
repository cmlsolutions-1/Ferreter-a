export class UpdateContainerDto {
  private constructor(
    public id?: string,
    public name?: string,
    public date?: Date,
  ) {}

  static update(object: { [key: string]: any }): [string?, UpdateContainerDto?] {
    const { id, name, date } = object;

    if (!id && !name && !date) {
      return ['Debe proporcionar al menos un campo para actualizar'];
    }

    let parsedDate: Date | undefined;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return ['El campo "date" no es una fecha válida'];
    }

    return [undefined, new UpdateContainerDto(id, name, parsedDate)];
  }
}
