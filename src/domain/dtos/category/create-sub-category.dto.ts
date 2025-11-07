
export class CreateSubCategoryDto {
  private constructor(
    public name: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateSubCategoryDto?] {
    const { name } = object;

    if (!name) return ['El campo "nombre" es requerido'];


    return [undefined, new CreateSubCategoryDto( name)];
  }
}
