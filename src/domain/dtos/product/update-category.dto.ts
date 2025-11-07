export class UpdateCategoryDto {
  private constructor(
    public category?: string
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdateCategoryDto?] {
    const { category } = object;

    if (typeof category !== 'string') return ['el valor debe ser un string'];

    return [undefined, new UpdateCategoryDto(category)];
    
  }
}
