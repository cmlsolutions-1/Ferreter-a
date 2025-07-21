export class UserEmailDto {
  constructor(
    public emailAddress: string,
    public isPrincipal: boolean,
  ) {}

  static fromModel(model: any): UserEmailDto {
    return new UserEmailDto(model.EmailAddres, model.IsPrincipal);
  }

  static fromModelArray(models: any[]): UserEmailDto[] {
    return models.map(model => this.fromModel(model));
  }
}

export class UserPhoneDto {
  constructor(
    public numberPhone: string,
    public indicative: string,
    public isPrincipal: boolean,
  ) {}

  static fromModel(model: any): UserPhoneDto {
    return new UserPhoneDto(model.NumberPhone, model.Indicative, model.IsPrincipal);
  }

  static fromModelArray(models: any[]): UserPhoneDto[] {
    return models.map(model => this.fromModel(model));
  }
}
