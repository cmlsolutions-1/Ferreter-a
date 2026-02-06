import { ImageDto } from "../Image/image.dto";
import { ProductPriceDto } from "./sub-dto-anidados";
import { ProductPackageDto } from "./sub-dto-anidados";
import { ProductStockDto } from "./sub-dto-anidados";

export class GetProductByIdDto {
  constructor(
    public _id: string,
    public referencia: string,
    public codigo: string,
    public detalle: string,
    public image: ImageDto | null,
    public subCategory: any,
    public precios: ProductPriceDto[],
    public packages: any[],
    public stock: number,
    public brand?: any,
    public isFavorite?: boolean,
  ) {}

  static fromModel(model: any): GetProductByIdDto {
    return new GetProductByIdDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.description,
      model.image ? ImageDto.fromModel(model.image) : null,
      model.subCategory ?? null,
      ProductPriceDto.fromModelArray(model.prices || []),
      model.package || [],
      model.platformStock || 0,
      model.brand || null,
      model.isFavorite || false,
    );
  }
}
