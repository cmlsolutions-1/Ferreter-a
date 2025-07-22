export class GetClientsBySalesPersonDto {
  constructor(
    public _id: string, 
    public id: string,
    public name: string,
    public lastName: string,
    public email: string, 
    public phone: string, 
    public state: 'Active' | 'Inactive',
  ) {}

  static fromModel(model: any): GetClientsBySalesPersonDto {
    const principalEmail = model.email?.find((e: any) => e.IsPrincipal)?.EmailAddres ?? '';
    const principalPhone = model.phone?.find((p: any) => p.IsPrincipal)?.NumberPhone ?? '';

    return new GetClientsBySalesPersonDto(
      model._id,
      model.id,
      model.name,
      model.lastName,
      principalEmail,
      principalPhone,
      model.state
    );
  }

  static fromModelArray(models: any[]): GetClientsBySalesPersonDto[] {
    return models.map(model => this.fromModel(model));
  }
}