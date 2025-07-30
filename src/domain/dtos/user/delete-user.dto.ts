export enum UserState {
  Active = "Active",
  Inactive = "Inactive",
}

export class DeleteUserDto {
  private constructor(
    public _id: string
  ) {}

  static create(object: { [key: string]: any }): [string?, DeleteUserDto?] {
    const { _id } = object;

    if (!_id) return ["El ID es obligatorio para eliminar o desactivar al usuario"];

    return [undefined, new DeleteUserDto(_id)];
  }
}
