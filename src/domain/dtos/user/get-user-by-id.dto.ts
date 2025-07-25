import { UserEmailDto } from "./sub-dto-user.dto";
import { UserPhoneDto } from "./sub-dto-user.dto";

export class GetUserByIdDto {
  constructor(
    public _id: string, 
    public id: string,
    public name: string,
    public lastName: string,
    public emailVerified: boolean,
    public emails: UserEmailDto[],
    public phones: UserPhoneDto[],
    public address: string[],
    public cityId: string,
    public role: 'Admin' | 'SalesPerson' | 'Client',
    public salesPersonId: string | null,
    public clientIds: string[],
    public priceCategoryId: string | null,
    public state: 'Active' | 'Inactive',
  ) {}

  static fromModel(model: any): GetUserByIdDto {
    return new GetUserByIdDto(
      model._id?.toString() ?? model.id?.toString() ?? '',
      model.id,
      model.name,
      model.lastName,
      model.emailVerified ?? false,
      UserEmailDto.fromModelArray(model.email || []),
      UserPhoneDto.fromModelArray(model.phone || []),
      model.addres || [],
      model.city?._id?.toString() ?? model.city?.toString() ?? '',
      model.role,
      model.salesPerson?._id?.toString() ?? model.salesPerson?.toString() ?? null,
      (model.clients || []).map((c: any) => c?._id?.toString() ?? c.toString()),
      model.priceCategory?._id?.toString() ?? model.priceCategory?.toString() ?? null,
      model.state,
    );
  }
}
