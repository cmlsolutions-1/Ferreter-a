export class ListProductByCategoryDto {
  constructor(
    public reference: string,
    public code: string,
    public title: string,
    public description: string,
    public imageId: string,
  ) {}

  static fromModel(model: any): ListProductByCategoryDto {
    return new ListProductByCategoryDto(
      model.reference,
      model.code,
      model.title,
      model.description,
      model.image?._id?.toString() ?? model.image?.toString() ?? ''
    );
  }

  static fromModelArray(models: any[]): ListProductByCategoryDto[] {
    return models.map(m => this.fromModel(m));
  }
}
