import { UserEmailDto } from "./sub-dto-user.dto";
import { UserPhoneDto } from "./sub-dto-user.dto";

export class ViewUserDto {
  constructor(
    public _id: string, 
    public id: string,
    public name: string,
    public lastName: string,
    public emails: UserEmailDto[],
    public phones: UserPhoneDto[],
    public cityId: string,
    public role: 'Admin' | 'SalesPerson' | 'Client',
    public state: 'Active' | 'Inactive',
    public address: string[],
    public extra: any = null 
  ) {}

  static fromModel(model: any): ViewUserDto {
    const base = new ViewUserDto(
      model._id?.toString() ?? model.id?.toString() ?? '',
      model.id,
      model.name,
      model.lastName,
      UserEmailDto.fromModelArray(model.email || []),
      UserPhoneDto.fromModelArray(model.phone || []),
      model.city?._id?.toString() ?? model.city?.toString() ?? '',
      model.role,
      model.state,
      model.addres || [],
      null
    );

    switch (model.role) {
      case 'Admin':
        base.extra = {}; // Admin no necesita extra info por ahora
        break;

      case 'SalesPerson':
        base.extra = {
          clients: (model.clients || []).map((c: any) => ({
            id: c._id?.toString() ?? c.toString(),
            name: c.name,
            lastName: c.lastName,
          }))
        };
        break;

      case 'Client':
        base.extra = {
          salesPerson: model.salesPerson
            ? {
                id: model.salesPerson._id?.toString() ?? model.salesPerson.toString(),
                name: model.salesPerson.name,
                lastName: model.salesPerson.lastName,
              }
            : null,
          priceCategoryId: model.priceCategory?._id?.toString() ?? model.priceCategory?.toString() ?? null
        };
        break;
    }

    return base;
  }

  static fromModelArray(models: any[]): ViewUserDto[] {
    return models.map(model => ViewUserDto.fromModel(model));
  }

}
