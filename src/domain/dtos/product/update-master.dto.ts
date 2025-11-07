export class UpdateMasterDto {
  private constructor(
    public mount?: number
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdateMasterDto?] {
    const { mount } = object;

    if (typeof mount !== 'number') return ['el valor debe ser un número'];


    return [undefined, new UpdateMasterDto(mount)];
  }
}
