export class ListContainerDto {
  constructor(
    public id: string,
    public name: string,
    public date: Date,
    public state: 'Active' | 'Inactive',
  ) {}

  static fromModel(model: any): ListContainerDto {
    return new ListContainerDto(
      model.id,
      model.name,
      model.Date,
      model.state,
    );
  }

  static fromModelArray(models: any[]): ListContainerDto[] {
    return models.map(model => this.fromModel(model));
  }
}
