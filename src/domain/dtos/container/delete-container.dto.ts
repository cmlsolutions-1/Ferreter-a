export enum ContainerState {
  Active = "Active",
  Inactive = "Inactive",
}

export class DeleteContainerDto {
  private constructor(
    public id: string,
    public state: ContainerState,
  ) {}

  static create(object: { [key: string]: any }): [string?, DeleteContainerDto?] {
    const { id, state } = object;

    if (!id) return ["El ID es obligatorio para eliminar o desactivar el contenedor"];
    if (!state) return ["El estado es obligatorio"];
    if (!Object.values(ContainerState).includes(state)) {
      return ["El estado debe ser 'Active' o 'Inactive'"];
    }

    return [undefined, new DeleteContainerDto(id, state)];
  }
}
