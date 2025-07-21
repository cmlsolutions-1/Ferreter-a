
export class CreateCategoryDto {
  private constructor(
    public name: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateCategoryDto?] {
    const { name } = object;

    if (!name) return ['El campo "name" es requerido'];


    return [undefined, new CreateCategoryDto(name)];
  }
}

