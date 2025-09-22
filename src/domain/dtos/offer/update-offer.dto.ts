export class UpdateOfferDto {
  private constructor(
    public name?: string,
    public percentage?: number,
    public minimumQuantity?: number,
    public startDate?: Date,
    public endDate?: Date,
    public typePackage?: 'master' | 'inner',
    public state?: 'Active' | 'Inactive',
    public isAll?: boolean,
    public products?: string[],
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateOfferDto?] {
    const {
      name,
      percentage,
      minimumQuantity,
      startDate,
      endDate,
      typePackage,
      state,
      isAll,
      products,
    } = object;

    const allowedTypePackages = ['inner', 'mount'];
    const allowedStates = ['Active', 'Inactive'];

    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) return ['El campo "startDate" no es una fecha válida'];
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) return ['El campo "endDate" no es una fecha válida'];
    }

    if (typePackage && !allowedTypePackages.includes(typePackage)) {
      return ['El campo "typePackage" debe ser "master" o "inner"'];
    }

    if (state && !allowedStates.includes(state)) {
      return ['El campo "state" debe ser "Active" o "Inactive"'];
    }

    if (isAll === false && (!products || !Array.isArray(products) || products.length === 0)) {
      return ['Debes proporcionar productos si "isAll" es false'];
    }

    return [
      undefined,
      new UpdateOfferDto(
        name,
        percentage,
        minimumQuantity,
        parsedStartDate,
        parsedEndDate,
        typePackage,
        state,
        isAll,
        products
      )
    ];
  }
}
