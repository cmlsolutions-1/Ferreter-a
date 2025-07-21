export enum UserState {
  Active = "Active",
  Inactive = "Inactive",
}

export class DeleteUserDto {
  private constructor(
    public id: string,
    public state: UserState,
  ) {}

  static create(object: { [key: string]: any }): [string?, DeleteUserDto?] {
    const { id, state } = object;

    if (!id) return ["El ID es obligatorio para eliminar o desactivar al usuario"];
    if (!state) return ["El estado es obligatorio"];
    if (!Object.values(UserState).includes(state)) {
      return ["El estado debe ser 'Active' o 'Inactive'"];
    }

    return [undefined, new DeleteUserDto(id, state)];
  }
}
