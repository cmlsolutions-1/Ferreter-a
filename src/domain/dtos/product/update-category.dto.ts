export class FavoriteDto {
  private constructor(
    public state?: boolean
  ) { }

  static create(object: { [key: string]: any }): [string?, FavoriteDto?] {
    const { state } = object;

    if (typeof state !== 'boolean') return ['el valor debe ser un boolean'];

    return [undefined, new FavoriteDto(state)];
    
  }
}
