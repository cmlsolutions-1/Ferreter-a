export class OfferProductDto {
  constructor(
    public id: string,
    public idProduct: string,
    public productName: string, // asumimos que accedes al nombre del producto
  ) {}

  static fromModel(model: any): OfferProductDto {
    return new OfferProductDto(
      model.id,
      model.idProduct.id,
      model.idProduct.name,
    );
  }

  static fromModelArray(models: any[]): OfferProductDto[] {
    return models.map(model => this.fromModel(model));
  }
}
