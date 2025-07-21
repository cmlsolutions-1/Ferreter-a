export class ListSubCategoryDto {
  constructor(
    public idSubCategory: string,
    public idCategory: string,
    public name: string,
  ) {}

  static fromModel(model: any): ListSubCategoryDto {
    return new ListSubCategoryDto(
      model.idSubCategory,
      model.idCategory,
      model.name,
    );
  }

  static fromModelArray(models: any[]): ListSubCategoryDto[] {
    return models.map(model => this.fromModel(model));
  }
}
