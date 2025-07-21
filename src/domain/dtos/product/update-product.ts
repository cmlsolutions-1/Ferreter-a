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

export class UpdateProductDto {
  private constructor(
    public code?: string,
    public title?: string,
    public description?: string,
    public image?: string,
    public category?: string,
    public prices?: PriceDto[],
    public packagee?: PackageDto[],
    public stock?: StockDto[],
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateProductDto?] {
    const { code, title, description, image, category, prices, package: pkg, stock } = object;

    // if (!reference && !code && !title && !description && !image && !category && !prices && !pkg && !stock) {
    //   return ['Debe proporcionar al menos un campo para actualizar'];
    // }

    if (prices) {
      if (!Array.isArray(prices)) return ['El campo prices debe ser un arreglo'];
      for (const price of prices) {
        if (!price.PriceCategory) return ['PriceCategory es obligatorio en cada precio'];
        if (typeof price.Value !== 'number') return ['Value debe ser un número en cada precio'];
        if (typeof price.PosValue !== 'number') return ['PosValue debe ser un número en cada precio'];
      }
    }

    if (pkg) {
      if (!Array.isArray(pkg)) return ['El campo package debe ser un arreglo'];
      for (const p of pkg) {
        if (!['Inner', 'Master'].includes(p.typePackage)) return ['typePackage debe ser "Inner" o "Master" en cada package'];
        if (typeof p.Mount !== 'number') return ['Mount debe ser un número en cada package'];
      }
    }

    if (stock) {
      if (!Array.isArray(stock)) return ['El campo stock debe ser un arreglo'];
      for (const s of stock) {
        if (!s.Store) return ['Store es obligatorio en cada stock'];
        if (typeof s.Mount !== 'number') return ['Mount debe ser un número en cada stock'];
      }
    }

    return [undefined, new UpdateProductDto(code,title, description, image, category, prices, pkg, stock)];
  }
}
