export class FilterProductDto {
  private constructor(
    public search?: string,
    public page: number = 1,
    public limit: number = 10,
    public categories?: string[],
    public brands?: string[]
  ) {}

  static create(query: { [key: string]: any }, body: { [key: string]: any }): [string?, FilterProductDto?] {
    const { search, page, limit } = query;
    const { categories, brands } = body;

    // Validaciones básicas
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (isNaN(parsedPage) || parsedPage < 1) {
      return ['El parámetro "page" debe ser un número mayor a 0'];
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return ['El parámetro "limit" debe ser un número mayor a 0'];
    }

    return [
      undefined,
      new FilterProductDto(
        search,
        parsedPage,
        parsedLimit,
        Array.isArray(categories) ? categories : [],
        Array.isArray(brands) ? brands : []
      )
    ];
  }
}
