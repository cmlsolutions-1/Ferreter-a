import { ProductPriceDto } from "./sub-dto-anidados";
import { ProductPackageDto } from "./sub-dto-anidados";
import { ProductStockDto } from "./sub-dto-anidados";

export class GetProductByIdDto {
  constructor(
    public _id: string,
    public referencia: string,
    public codigo: string,
    public detalle: string,
    public image: string,
    public subCategory: string,
    public precios: ProductPriceDto[],
    public packages: ProductPackageDto[],
    public stock: number,
  ) {}

  static fromModel(model: any): GetProductByIdDto {
    return new GetProductByIdDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.description,
      model.image?._id?.toString() ?? model.image?.toString() ?? '',
      model.subCategory?._id?.toString() ?? model.subCategory?.toString() ?? '',
      ProductPriceDto.fromModelArray(model.prices || []),
      ProductPackageDto.fromModelArray(model.package || []),
      model.stock || 0,
    );
  }
}
