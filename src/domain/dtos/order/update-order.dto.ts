import { Types } from 'mongoose';

export interface UpdateOrderItemDto {
  id: string;
  quantity?: number;
  price?: number;
  idProduct?: Types.ObjectId | string;
}

export class UpdateOrderDto {
  constructor(
    public id?: string,
    public subTotal?: number,
    public tax?: number,
    public total?: string,
    public updatedDate?: Date,
    public idClient?: Types.ObjectId | string,
    public idSalesPerson?: Types.ObjectId | string,
    public items?: UpdateOrderItemDto[],
    public addres?: string,
  ) {}

  static update(data: { [key: string]: any }): [string?, UpdateOrderDto?] {
    const {
      id,
      subTotal,
      tax,
      total,
      idClient,
      idSalesPerson,
      items,
      addres
    } = data;

    if (id !== undefined && typeof id !== 'string') {
      return ['El id debe ser un string'];
    }

    if (subTotal !== undefined && typeof subTotal !== 'number') {
      return ['El subTotal debe ser un número'];
    }

    if (tax !== undefined && typeof tax !== 'number') {
      return ['El tax debe ser un número'];
    }

    if (total !== undefined && typeof total !== 'string') {
      return ['El total debe ser un string'];
    }

    if (idClient !== undefined && typeof idClient !== 'string') {
      return ['El idClient debe ser un string'];
    }

    if (idSalesPerson !== undefined && typeof idSalesPerson !== 'string') {
      return ['El idSalesPerson debe ser un string'];
    }

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return ['El campo items debe ser un arreglo'];
      }

      for (const item of items) {
        if (!item.id || typeof item.id !== 'string') {
          return ['Cada item debe tener un id de tipo string'];
        }

        if (item.quantity !== undefined && typeof item.quantity !== 'number') {
          return ['La cantidad (quantity) del item debe ser un número'];
        }

        if (item.price !== undefined && typeof item.price !== 'number') {
          return ['El precio (price) del item debe ser un número'];
        }

        if (item.idProduct !== undefined && typeof item.idProduct !== 'string') {
          return ['El idProduct del item debe ser un string'];
        }
      }
    }

    return [undefined, new UpdateOrderDto(
      id,
      subTotal,
      tax,
      total,
      new Date(),
      idClient,
      idSalesPerson,
      items,
      addres
    )];
  }
}
