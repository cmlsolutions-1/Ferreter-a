export class ListCategoryDto {
  constructor(
    public idCategory: string,
    public name: string,
  ) {}

  static fromModel(model: any): ListCategoryDto {
    return new ListCategoryDto(
      model.idCategory,
      model.name,
    );
  }

  static fromModelArray(models: any[]): ListCategoryDto[] {
    return models.map(model => this.fromModel(model));
  }
}
