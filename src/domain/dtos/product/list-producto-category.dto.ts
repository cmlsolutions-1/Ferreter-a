import { ImageDto } from "../Image/image.dto";
import { ProductPackageDto, ProductPriceDto } from "./sub-dto-anidados";

export class ListProductByCategoryDto {
  constructor(
     public _id: string,
        public referencia: string,
        public codigo: string,
        public detalle: string,
        public subgategoryId: string,
        public image: ImageDto | null,
        public precios: ProductPriceDto[],
        public packages: ProductPackageDto[],
        public stock: number,
  ) {}

  static fromModel(model: any): ListProductByCategoryDto {
    return new ListProductByCategoryDto(
      model._id.toString(),
      model.reference,
      model.code,
      model.description,
      model.subCategory?.toString() ?? '',
      model.image ? ImageDto.fromModel(model.image) : null,
      ProductPriceDto.fromModelArray(model.prices || []),
      ProductPackageDto.fromModelArray(model.package || []),
      model.stock || 0,
    );
  }

  static fromModelArray(models: any[]): ListProductByCategoryDto[] {
    return models.map(m => this.fromModel(m));
  }
}
