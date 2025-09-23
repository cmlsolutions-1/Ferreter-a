import { OfferProductDto } from "./offer-product.dto";

export class GetOfferByIdDto {
  constructor(
    public _id: string,
    public name: string,
    public percentage: number,
    public minimumQuantity: number,
    public crationDate: Date,
    public startDate: Date,
    public endDate: Date,
    public finishDate: Date | null,
    public typePackage: 'master' | 'mount',
    public state: 'Active' | 'Inactive',
    public isAll: boolean,
    public products: any[],
  ) {}

  static fromModel(offer: any): GetOfferByIdDto {
    return new GetOfferByIdDto(
      offer._id,
      offer.name,
      offer.percentage,
      offer.minimumQuantity,
      offer.crationDate,
      offer.startDate,
      offer.endDate,
      offer.finishDate ?? null,
      offer.typePackage,
      offer.state,
      offer.isAll,
      offer.products,
    );
  }
}
