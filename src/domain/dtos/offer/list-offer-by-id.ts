export class ListOfferDto {
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
  ) {}

  static fromModel(model: any): ListOfferDto {
    return new ListOfferDto(
      model.id,
      model.percentage,
      model.minimumQuantity,
      model.crationDate,
      model.startDate,
      model.endDate,
      model.finishDate ?? null,
      model.typePackage,
      model.state,
      model.isAll,
    );
  }

  static fromModelArray(models: any[]): ListOfferDto[] {
    return models.map(model => this.fromModel(model));
  }
}
