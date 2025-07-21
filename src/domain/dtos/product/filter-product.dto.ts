export class FilterProductDto {
  private constructor(
    public reference?: string,
    public title?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, FilterProductDto?] {
    const { reference, title } = object;

    if (!reference && !title) {
      return ['Debe proporcionar al menos el "reference" o el "title" para filtrar'];
    }

    if (reference && typeof reference !== 'string') {
      return ['El campo "reference" debe ser una cadena'];
    }

    if (title && typeof title !== 'string') {
      return ['El campo "title" debe ser una cadena'];
    }

    return [undefined, new FilterProductDto(reference, title)];
  }
}
