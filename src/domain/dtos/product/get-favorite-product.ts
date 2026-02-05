export  class GetFavoriteProductDto {
    
  private constructor(
    public page: number = 1,
    public limit: number = 10
  ) {}


  static create(query: { [key: string]: any }): [string?, GetFavoriteProductDto?] {
    const {  page, limit } = query;
    
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
      new GetFavoriteProductDto(
        parsedPage,
        parsedLimit,
      )
    ];
  }
}