export class ProductPriceDto {
  constructor(
    public precio: string,
    public valor: number,
    public valorpos: number,
  ) {}

  static fromModel(model: any): ProductPriceDto {
    return new ProductPriceDto(
      model.PriceCategory?.code || '',
      model.Value,
      model.PosValue,
    );
  }

  static fromModelArray(models: any[]): ProductPriceDto[] {
    return models.map(model => this.fromModel(model));
  }
}

export class ProductPackageDto {
  constructor(
    public typePackage: 'Inner' | 'Master',
    public mount: number,
  ) {}

  static fromModel(model: any): ProductPackageDto {
    return new ProductPackageDto(model.typePackage, model.Mount);
  }

  static fromModelArray(models: any[]): ProductPackageDto[] {
    return models.map(model => this.fromModel(model));
  }
}

export class ProductStockDto {
  constructor(
    public store: string,
    public mount: number,
  ) {}

  static fromModel(model: any): ProductStockDto {
    return new ProductStockDto(model.Store, model.Mount);
  }

  static fromModelArray(models: any[]): ProductStockDto[] {
    return models.map(model => this.fromModel(model));
  }
}
