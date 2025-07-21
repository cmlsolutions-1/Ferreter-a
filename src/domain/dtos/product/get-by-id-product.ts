import { ProductPriceDto } from "./sub-dto-anidados";
import { ProductPackageDto } from "./sub-dto-anidados";
import { ProductStockDto } from "./sub-dto-anidados";

export class GetProductByIdDto {
  constructor(
    public reference: string,
    public code: string,
    public title: string,
    public description: string,
    public imageId: string,
    public categoryId: string,
    public prices: ProductPriceDto[],
    public packages: ProductPackageDto[],
    public stock: ProductStockDto[],
  ) {}

  static fromModel(model: any): GetProductByIdDto {
    return new GetProductByIdDto(
      model.reference,
      model.code,
      model.title,
      model.description,
      model.image?._id?.toString() ?? model.image?.toString() ?? '',
      model.category?._id?.toString() ?? model.category?.toString() ?? '',
      ProductPriceDto.fromModelArray(model.prices || []),
      ProductPackageDto.fromModelArray(model.package || []),
      ProductStockDto.fromModelArray(model.stock || []),
    );
  }
}
