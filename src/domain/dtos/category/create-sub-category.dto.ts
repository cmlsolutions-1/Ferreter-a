
export class CreateSubCategoryDto {
  private constructor(
    public idCategory: string,
    public name: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateSubCategoryDto?] {
    const {idCategory, name } = object;

    if (!idCategory) return ['El campo "idCategory" es requerido'];
    if (!name) return ['El campo "total" es requerido'];


    return [undefined, new CreateSubCategoryDto(idCategory, name)];
  }
}
