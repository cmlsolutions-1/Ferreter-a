import { regularExps } from "../../../config";

interface PhoneDto {
  numberPhone: string;
  isPrincipal: boolean;
  indicative: string;
}

interface EmailDto {
  emailAddres: string;
  isPrincipal: boolean;
}

enum Role {
  Admin = "Admin",
  SalesPerson = "SalesPerson",
  Client = "Client",
}

export class RegisterUserDto {
  private constructor(
    public id: string,
    public name: string,
    public lastName: string,
    public email: EmailDto[],
    public phone: PhoneDto[],
    public address: string[],
    public city: string,
    public password: string,
    public role: Role,
    public priceCategory: string,
    public salesPerson?: string,
    public clients?: string[],
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const {
      id,
      name,
      lastName,
      email,
      phone,
      address,
      city,
      password,
      role,
      priceCategory,
      salesPerson,
      clients,
    } = object;

    if (!id) return ["campo id faltante"];
    if (!name) return ["campo name faltante"];
    if (!lastName) return ["campo lastName faltante"];

    if (!Array.isArray(email) || email.length === 0) return ["El email es requerido"];
    let hasPrincipalEmail = false;
    for (const e of email) {
      if (!e.emailAddres || !regularExps.email.test(e.emailAddres)) return [`Direccion de correo invalida: ${e.emailAddres}`];
      if (typeof e.isPrincipal !== "boolean") return ["El campo isPrincial debe ser de tipo boolean"];
      if (e.isPrincipal) hasPrincipalEmail = true;
    }
    if (!hasPrincipalEmail) return ["Debe haber almenos un correo principal"];

    if (!Array.isArray(phone) || phone.length === 0) return ["El telefono es requerido"];
    let hasPrincipalPhone = false;
    for (const p of phone) {
      if (!p.numberPhone) return ["El telefono es requerido"];
      if (typeof p.isPrincipal !== "boolean") return ["el campo IsPrincipal debe ser de tipo bool"];
      if (!p.indicative) return ["El indicativo es requerido"];
      if (p.isPrincipal) hasPrincipalPhone = true;
    }
    if (!hasPrincipalPhone) return ["Debe haber almenos un numero de telefono principal"];

    if (!Array.isArray(address) || address.length === 0) return ["Se requiere una dirección"];
    if (!city) return ["city is required"];
    if (!password || password.length < 6) return ["El password debe ser de almenos 6 caracters"];
    if (!role || !Object.values(Role).includes(role)) return [`Campo de role invalido: ${role}`];
    if (!priceCategory) return ["la categoria de precio es requerida"];

    return [
      undefined,
      new RegisterUserDto(
        id,
        name,
        lastName,
        email,
        phone,
        address,
        city,
        password,
        role,
        priceCategory,
        salesPerson,
        clients,
      ),
    ];
  }
}
