export class ListProductDto {
  constructor(
    public reference: string,
    public code: string,
    public title: string,
    public categoryId: string,
    public imageId: string,
  ) {}

  static fromModel(model: any): ListProductDto {
    return new ListProductDto(
      model.reference,
      model.code,
      model.title,
      model.category?.toString() ?? '',
      model.image?.toString() ?? '',
    );
  }

  static fromModelArray(models: any[]): ListProductDto[] {
    return models.map(model => this.fromModel(model));
  }
}
