import { regularExps } from "../../../config";

interface PhoneDto {
  numberPhone: string;
  isPrincipal: boolean;
  indicative: string;
}

interface EmailDto {
  emailAddress: string;
  isPrincipal: boolean;
}

enum Role {
  Admin = "Admin",
  SalesPerson = "SalesPerson",
  Client = "Client",
}

export class UpdateUserDto {
  private constructor(
    public _id: string,
    public id: string,
    public name?: string,
    public lastName?: string,
    public email?: EmailDto[],
    public phone?: PhoneDto[],
    public address?: string[],
    public city?: string,
    public priceCategory?: string,
    public idSalesPerson?: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateUserDto?] {
    const {
      _id,  
      id,
      name,
      lastName,
      email,
      phone,
      address,
      city,
      role,
      priceCategory,
      idSalesPerson,
    } = object;

    if (!_id) return ["El ID es obligatorio para actualizar el usuario"];

    if (email) {
      if (!Array.isArray(email) || email.length === 0) return ["El campo email debe ser una lista"];
      let isPrincipal = false;
      for (const e of email) {
        if (!e.emailAddress || !regularExps.email.test(e.emailAddress)) return [`El correo no es válido: ${e.emailAddress}`];
        if (typeof e.isPrincipal !== "boolean") return ["El campo IsPrincipal en email debe ser booleano"];
        if (e.isPrincipal) isPrincipal = true;
      }
      if (!isPrincipal) return ["Debe haber al menos un correo principal"];
    }

    if (phone) {
      if (!Array.isArray(phone) || phone.length === 0) return ["El campo phone debe ser una lista"];
      let tienePrincipal = false;
      for (const p of phone) {
        if (!p.numberPhone) return ["El campo NumberPhone es obligatorio"];
        if (typeof p.isPrincipal !== "boolean") return ["El campo IsPrincipal en phone debe ser booleano"];
        if (!p.indicative) return ["El campo Indicative es obligatorio"];
        if (p.isPrincipal) tienePrincipal = true;
      }
      if (!tienePrincipal) return ["Debe haber al menos un número de teléfono principal"];
    }

    if (role && !Object.values(Role).includes(role)) return [`El rol no es válido: ${role}`];

    return [
      undefined,
      new UpdateUserDto(
        _id, 
        id,
        name,
        lastName,
        email,
        phone,
        address,
        city,
        priceCategory,
        idSalesPerson
      ),
    ];
  }
}
