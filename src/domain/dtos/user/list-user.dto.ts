export class ListUserDto {
  constructor(
    public id: string,
    public name: string,
    public lastName: string,
    public email: string, // principal
    public phone: string, // principal
    public cityId: string,
    public role: 'Admin' | 'SalesPerson' | 'Client',
    public state: 'Active' | 'Inactive',
  ) {}

  static fromModel(model: any): ListUserDto {
    const principalEmail = model.email?.find((e: any) => e.IsPrincipal)?.EmailAddres ?? '';
    const principalPhone = model.phone?.find((p: any) => p.IsPrincipal)?.NumberPhone ?? '';

    return new ListUserDto(
      model.id,
      model.name,
      model.lastName,
      principalEmail,
      principalPhone,
      model.city?._id?.toString() ?? model.city?.toString() ?? '',
      model.role,
      model.state,
    );
  }

  static fromModelArray(models: any[]): ListUserDto[] {
    return models.map(model => this.fromModel(model));
  }
}
