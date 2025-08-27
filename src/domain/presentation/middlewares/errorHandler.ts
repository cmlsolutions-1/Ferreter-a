// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../errors/custom.errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  console.error('Error no controlado aaaaaaaaaaaaaaa:', err);
  return res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    statusCode: 500,
  });
}
