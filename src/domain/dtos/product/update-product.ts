export interface PriceDto {
  precio: string;
  valor: number;
  valorpos: number;
}

export interface PackageDto {
  typePackage: 'Inner' | 'Master';
  Mount: number;
}

export class UpdateProductDto {
  private constructor(
    public code?: string,
    public description?: string,
    public category?: string,
    public prices?: PriceDto[],
    public packagee?: PackageDto[],
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdateProductDto?] {
    const { codigo, detalle, image, subCategory, precios, package: pkg } = object;

    if (precios) {
      if (!Array.isArray(precios)) return ['El campo precio debe ser un arreglo'];
      for (const price of precios) {
        if (!price.precio) return ['la categoría de precio es obligatorio en cada precio'];
        if (typeof price.valor !== 'number') return ['Value debe ser un número'];
        if (typeof price.valorpos !== 'number') return ['PosValue debe ser un número'];
      }
    }

    if (pkg) {
      if (!Array.isArray(pkg)) return ['El campo package debe ser un arreglo'];
      for (const p of pkg) {
        if (!['Inner', 'Master'].includes(p.typePackage)) return ['typePackage debe ser "Inner" o "Master" en cada package'];
        if (typeof p.Mount !== 'number') return ['Mount debe ser un número en cada package'];
      }
    }

    return [undefined, new UpdateProductDto(codigo, detalle, subCategory, precios, pkg)];
  }
}
