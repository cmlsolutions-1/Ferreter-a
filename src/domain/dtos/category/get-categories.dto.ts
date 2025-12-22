export class ListCategoryDto {
  constructor(
    public _id: string,
    public name: string,
    public code?: string,
  ) {}

  static fromModel(model: any): ListCategoryDto {
    return new ListCategoryDto(
      model._id,
      model.name,
      model.code,
    );
  }

  static fromModelArray(models: any[]): ListCategoryDto[] {
    return models.map(model => this.fromModel(model));
  }
}
