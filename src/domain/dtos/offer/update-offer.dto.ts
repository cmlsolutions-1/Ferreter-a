export class UpdateOfferDto {
  private constructor(
    public percentage?: number,
    public minimumQuantity?: number,
    public startDate?: Date,
    public endDate?: Date,
    public typePackage?: 'master' | 'mount',
    public state?: 'Active' | 'Inactive',
    public isAll?: boolean,
    public productIds?: string[],
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateOfferDto?] {
    const {
      percentage,
      minimumQuantity,
      startDate,
      endDate,
      typePackage,
      state,
      isAll,
      productIds,
    } = object;

    const allowedTypePackages = ['master', 'mount'];
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
      return ['El campo "typePackage" debe ser "master" o "mount"'];
    }

    if (state && !allowedStates.includes(state)) {
      return ['El campo "state" debe ser "Active" o "Inactive"'];
    }

    if (isAll === false && (!productIds || !Array.isArray(productIds) || productIds.length === 0)) {
      return ['Debes proporcionar productos si "isAll" es false'];
    }

    return [
      undefined,
      new UpdateOfferDto(
        percentage,
        minimumQuantity,
        parsedStartDate,
        parsedEndDate,
        typePackage,
        state,
        isAll,
        productIds
      )
    ];
  }
}
