export class ImageDto {
  constructor(
    public _id: string,
    public url: string,
    public name: string,
    public idCloud?: string,
  ) {}

  static fromModel(model: any): ImageDto {
    return new ImageDto(
      model._id.toString(),
      model.url,
      model.name,
      model.idCloud
    );
  }
}
