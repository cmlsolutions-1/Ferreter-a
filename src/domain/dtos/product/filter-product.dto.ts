export class FilterProductDto {
  private constructor(
    public reference?: string,
    public description?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, FilterProductDto?] {
    const { reference, description } = object;

    if (!reference && !description) {
      return ['Debe proporcionar al menos el "reference" o el "title" para filtrar'];
    }

    if (reference && typeof reference !== 'string') {
      return ['El campo "reference" debe ser una cadena'];
    }

    if (description && typeof description !== 'string') {
      return ['El campo "title" debe ser una cadena'];
    }

    return [undefined, new FilterProductDto(reference, description)];
  }
}
