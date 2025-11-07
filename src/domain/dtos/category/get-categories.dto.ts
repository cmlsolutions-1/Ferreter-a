export class ListCategoryDto {
  constructor(
    public _id: string,
    public name: string,
  ) {}

  static fromModel(model: any): ListCategoryDto {
    return new ListCategoryDto(
      model._id,
      model.name,
    );
  }

  static fromModelArray(models: any[]): ListCategoryDto[] {
    return models.map(model => this.fromModel(model));
  }
}
