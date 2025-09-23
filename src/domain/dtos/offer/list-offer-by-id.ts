export class ListOfferDto {
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
    public products?: any[],
  ) {}

  static fromModel(model: any): ListOfferDto {
    return new ListOfferDto(
      model._id,
      model.name,
      model.percentage,
      model.minimumQuantity,
      model.crationDate,
      model.startDate,
      model.endDate,
      model.finishDate ?? null,
      model.typePackage,
      model.state,
      model.isAll,
      model.products
    );
  }

  static fromModelArray(models: any[]): ListOfferDto[] {
    return models.map(model => this.fromModel(model));
  }
}
