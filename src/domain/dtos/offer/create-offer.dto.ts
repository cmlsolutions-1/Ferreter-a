export class CreateOfferDto {
  private constructor(
    public name: string,
    public percentage: number,
    public startDate: Date,
    public endDate: Date,
    public typePackage: 'master' | 'inner',
    public isAll?: boolean,
    public state?: 'Active' | 'Inactive',
    public products?: string[],
    public minimumQuantity?: number,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateOfferDto?] {
    const {
      name,
      percentage,
      startDate,
      endDate,
      typePackage,
      isAll,
      state,
      products,
      minimumQuantity
    } = object;

    if (typeof percentage !== 'number') return ['El campo "percentage" debe ser un número'];
    if (typeof minimumQuantity !== 'number') return ['El campo "minimumQuantity" debe ser un número'];
    if (!startDate) return ['El campo "startDate" es obligatorio'];
    if (!endDate) return ['El campo "endDate" es obligatorio'];
    if (!typePackage || !['master', 'inner'].includes(typePackage)) {
      return ['El campo "typePackage" debe ser "master" o "inner"'];
    }
    if (typeof isAll !== 'boolean') return ['El campo "isAll" debe ser booleano'];

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime())) return ['El campo "startDate" no es una fecha válida'];
    if (isNaN(parsedEndDate.getTime())) return ['El campo "endDate" no es una fecha válida'];

    if (state && !['Active', 'Inactive'].includes(state)) {
      return ['El campo "state" debe ser "Active" o "Inactive"'];
    }

    if (!isAll) {
      if (!Array.isArray(products) || products.length === 0) {
        return ['Debe proporcionar al menos un "productId" si "isAll" es false'];
      }
    }

    return [
      undefined,
      new CreateOfferDto(
        name,
        percentage,
        parsedStartDate,
        parsedEndDate,
        typePackage,
        isAll,
        state,
        products,
        minimumQuantity,
      ),
    ];
  }
}
