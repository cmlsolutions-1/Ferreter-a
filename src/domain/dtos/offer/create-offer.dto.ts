export class CreateOfferDto {
  private constructor(
    public id: string,
    public percentage: number,
    public minimumQuantity: number,
    public startDate: Date,
    public endDate: Date,
    public typePackage: 'master' | 'mount',
    public isAll: boolean,
    public finishDate?: Date,
    public state?: 'Active' | 'Inactive',
    public productIds?: string[], // Solo si isAll es false
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateOfferDto?] {
    const {
      id,
      percentage,
      minimumQuantity,
      startDate,
      endDate,
      typePackage,
      isAll,
      finishDate,
      state,
      productIds,
    } = object;

    if (!id) return ['El campo "id" es obligatorio'];
    if (typeof percentage !== 'number') return ['El campo "percentage" debe ser un número'];
    if (typeof minimumQuantity !== 'number') return ['El campo "minimumQuantity" debe ser un número'];
    if (!startDate) return ['El campo "startDate" es obligatorio'];
    if (!endDate) return ['El campo "endDate" es obligatorio'];
    if (!typePackage || !['master', 'mount'].includes(typePackage)) {
      return ['El campo "typePackage" debe ser "master" o "mount"'];
    }
    if (typeof isAll !== 'boolean') return ['El campo "isAll" debe ser booleano'];

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const parsedFinishDate = finishDate ? new Date(finishDate) : undefined;

    if (isNaN(parsedStartDate.getTime())) return ['El campo "startDate" no es una fecha válida'];
    if (isNaN(parsedEndDate.getTime())) return ['El campo "endDate" no es una fecha válida'];
    if (finishDate && isNaN(parsedFinishDate!.getTime())) return ['El campo "finishDate" no es una fecha válida'];

    if (state && !['Active', 'Inactive'].includes(state)) {
      return ['El campo "state" debe ser "Active" o "Inactive"'];
    }

    if (!isAll) {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return ['Debe proporcionar al menos un "productId" si "isAll" es false'];
      }
      for (const id of productIds) {
        if (typeof id !== 'string') return ['Cada "productId" debe ser un string'];
      }
    }

    return [
      undefined,
      new CreateOfferDto(
        id,
        percentage,
        minimumQuantity,
        parsedStartDate,
        parsedEndDate,
        typePackage,
        isAll,
        parsedFinishDate,
        state,
        productIds
      ),
    ];
  }
}
