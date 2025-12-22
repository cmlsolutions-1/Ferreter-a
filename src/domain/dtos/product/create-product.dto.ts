export interface PriceDto {
  precio: string; 
  valor: number;
  valorpos: number;
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
    public description: string,
    public prices: PriceDto[],
    public packagee?: PackageDto[],
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateProductDto?] {
    const { referencia, codigo, detalle, precios, package: pkg } = object;

    if (!referencia) return ['El campo referencia es obligatorio'];
    if (!codigo) return ['El campo code es obligatorio'];
    if (!detalle) return ['El campo detalle es obligatorio'];
    if (!precios || !Array.isArray(precios) || precios.length === 0) {
      return ['Debe incluir al menos un precio (prices)'];
    }

    for (const price of precios) {
      if (!price.precio) return ['la categoría de precio es obligatorio en cada precio'];
      if (typeof price.valor !== 'number') return ['Value debe ser un número'];
      if (typeof price.valorpos !== 'number') return ['PosValue debe ser un número'];
    }

    if (pkg) {
      for (const p of pkg) {
        if (!['Inner', 'Master'].includes(p.typePackage)) return ['typePackage debe ser "Inner" o "Master"'];
        if (typeof p.Mount !== 'number') return ['Mount debe ser un número en cada package'];
      }
    }

    return [undefined, new CreateProductDto(referencia, codigo, detalle, precios, pkg)];
  }
}
