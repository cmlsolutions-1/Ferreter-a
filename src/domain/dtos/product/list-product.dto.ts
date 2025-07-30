export class ListProductDto {
  constructor(
    public _id: string,
    public reference: string,
    public code: string,
    public title: string,
    public description: string,
    public categoryId: string,
    public imageId: string,
  ) {}

  static fromModel(model: any): ListProductDto {
    return new ListProductDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.title,
      model.description,
      model.subCategory?.toString() ?? '',
      model.image?.toString() ?? '',
    );
  }

  static fromModelArray(models: any[]): ListProductDto[] {
    return models.map(model => this.fromModel(model));
  }
}
