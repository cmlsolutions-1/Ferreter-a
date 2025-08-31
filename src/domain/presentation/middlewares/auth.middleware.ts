import { NextFunction, Request, Response } from 'express';
import { JwtAdapter } from '../../../config/jwt.adapter';
import { UserModel } from '../../../data/mongo/models/user.model';
import { CustomError } from '../../errors/custom.errors';


const enum Role {
  Admin = 'Admin',
  SalesPerson = 'SalesPerson',
  Client = 'Client',
};
  

export class AuthMiddleware {


  static async validateJWT( req: Request, res: Response, next: NextFunction ) {

    const authorization = req.header('Authorization');
    if( !authorization ) throw CustomError.unauthorized('Token no provided');
    if ( !authorization.startsWith('Bearer ') )  throw CustomError.unauthorized('Token no provided');

    const token = authorization.split(' ').at(1) || '';


    try {

      const payload = await JwtAdapter.validateToken<{ _id: string, role: Role, priceCategory: string, email: string, name: string, id: string }>(token);
      if ( !payload ) throw CustomError.unauthorized('Token invalido'); 
      
      const user = await UserModel.findById( payload._id );
      if ( !user ) throw CustomError.unauthorized('token de usuario no existe'); 

      if ( !user.emailValidated ) throw CustomError.unauthorized('El usuario no ha validado su correo');

      req.body.user = payload;

      next();

    } catch (error) {
      
      next(error);
      console.log(error);
      
    }
    
  }

}


