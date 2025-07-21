export class InactivateOfferDto {
  private constructor(public state: 'Active' | 'Inactive') {}

  static create(object: { [key: string]: any }): [string?, InactivateOfferDto?] {
    const { state } = object;

    if (!state || !['Active', 'Inactive'].includes(state)) {
      return ['El campo "state" debe ser "Active" o "Inactive"'];
    }

    return [undefined, new InactivateOfferDto(state)];
  }
}