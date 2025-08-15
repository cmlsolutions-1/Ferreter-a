export class ListProductDto {
  constructor(
    public _id: string,
    public referencia: string,
    public codigo: string,
    public detalle: string,
    public subgategoryId: string,
    public image: string,
  ) {}

  static fromModel(model: any): ListProductDto {
    return new ListProductDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.description,
      model.subCategory?.toString() ?? '',
      model.image?.toString() ?? '',
    );
  }

  static fromModelArray(models: any[]): ListProductDto[] {
    return models.map(model => this.fromModel(model));
  }
}
