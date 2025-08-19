import { ProductPackageDto, ProductPriceDto } from "./sub-dto-anidados";

export class ListProductDto {
  constructor(
    public _id: string,
    public referencia: string,
    public codigo: string,
    public detalle: string,
    public subgategoryId: string,
    public image: string,
    public precios: ProductPriceDto[],
    public packages: ProductPackageDto[],
    public stock: number,
  ) {}

  static fromModel(model: any): ListProductDto {
    return new ListProductDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.description,
      model.subCategory?.toString() ?? '',
      model.image?.toString() ?? '',
      ProductPriceDto.fromModelArray(model.prices || []),
      ProductPackageDto.fromModelArray(model.package || []),
      model.stock || 0,
    );
  }

  static fromModelArray(models: any[]): ListProductDto[] {
    return models.map(model => this.fromModel(model));
  }
}
