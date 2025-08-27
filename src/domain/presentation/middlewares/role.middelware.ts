import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../errors/custom.errors';

export const hasRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.user) {
      throw CustomError.unauthorized('Se quiere verificar el rol sin validar token primero');
    }

    if (!roles.includes(req.body.user.role)) {
      throw CustomError.unauthorized(`El servicio requiere uno de estos roles: ${roles}`);
    }

    next();
  };
};