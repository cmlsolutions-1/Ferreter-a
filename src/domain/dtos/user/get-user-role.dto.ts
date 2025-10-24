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
    public address: string[],
    public city: any | null,
    public role: 'Admin' | 'SalesPerson' | 'Client',
    public salesPersonId: string | null,
    public clientIds: string[],
    public priceCategory: any | null,
    public state: 'Active' | 'Inactive',
  ) {}

  static fromModel(model: any): ViewUserDto {
    const base = new ViewUserDto(
      model._id?.toString() ?? model.id?.toString() ?? '',
      model.id,
      model.name,
      model.lastName,
      UserEmailDto.fromModelArray(model.email || []),
      UserPhoneDto.fromModelArray(model.phone || []),
      model.addres || [],
      model.city ?? '',
      model.role,
      model.salesPerson?._id?.toString() ?? model.salesPerson?.toString() ?? null,
      (model.clients || []).map((c: any) => c?._id?.toString() ?? c.toString()),
      model.priceCategory ?? null,
      model.state,

    );
    return base;
  }

  static fromModelArray(models: any[]): ViewUserDto[] {
    return models.map(model => ViewUserDto.fromModel(model));
  }

}
