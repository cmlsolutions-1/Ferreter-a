export interface PriceDto {
  PriceCategory: string; // ObjectId de PriceCategory
  Value: number;
  PosValue: number;
}

export interface PackageDto {
  typePackage: 'Inner' | 'Master';
  Mount: number;
}

export interface StockDto {
  Store: string;
  Mount: number;
}

export class CreateProductDto {
  private constructor(
    public reference: string,
    public code: string,
    public title: string,
    public description: string,
    public image: string,
    public subCategory: string,
    public prices: PriceDto[],
    public packagee?: PackageDto[],
    public stock?: StockDto[],
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateProductDto?] {
    const { reference, code, title, description, image, subCategory, prices, package: pkg, stock } = object;

    if (!reference) return ['El campo reference es obligatorio'];
    if (!code) return ['El campo code es obligatorio'];
    if (!title) return ['El campo title es obligatorio'];
    if (!description) return ['El campo description es obligatorio'];
    if (!image) return ['El campo image es obligatorio'];
    if (!subCategory) return ['El campo category es obligatorio'];
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      return ['Debe incluir al menos un precio (prices)'];
    }

    for (const price of prices) {
      if (!price.PriceCategory) return ['PriceCategory es obligatorio en cada precio'];
      if (typeof price.Value !== 'number') return ['Value debe ser un número'];
      if (typeof price.PosValue !== 'number') return ['PosValue debe ser un número'];
    }

    if (pkg) {
      for (const p of pkg) {
        if (!['Inner', 'Master'].includes(p.typePackage)) return ['typePackage debe ser "Inner" o "Master"'];
        if (typeof p.Mount !== 'number') return ['Mount debe ser un número en cada package'];
      }
    }

    if (stock) {
      for (const s of stock) {
        if (!s.Store) return ['Store es obligatorio en cada stock'];
        if (typeof s.Mount !== 'number') return ['Mount debe ser un número en cada stock'];
      }
    }

    return [undefined, new CreateProductDto(reference, code, title, description, image, subCategory, prices, pkg, stock)];
  }
}
