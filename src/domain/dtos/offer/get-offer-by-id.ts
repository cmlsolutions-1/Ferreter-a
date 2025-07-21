import { OfferProductDto } from "./offer-product.dto";

export class GetOfferByIdDto {
  constructor(
    public id: string,
    public percentage: number,
    public minimumQuantity: number,
    public crationDate: Date,
    public startDate: Date,
    public endDate: Date,
    public finishDate: Date | null,
    public typePackage: 'master' | 'mount',
    public state: 'Active' | 'Inactive',
    public isAll: boolean,
    public products: OfferProductDto[],
  ) {}

  static fromModel(offer: any, offerProducts: any[]): GetOfferByIdDto {
    return new GetOfferByIdDto(
      offer.id,
      offer.percentage,
      offer.minimumQuantity,
      offer.crationDate,
      offer.startDate,
      offer.endDate,
      offer.finishDate ?? null,
      offer.typePackage,
      offer.state,
      offer.isAll,
      OfferProductDto.fromModelArray(offerProducts),
    );
  }
}
