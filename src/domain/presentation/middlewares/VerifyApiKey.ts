import { Request, Response, NextFunction } from "express";

export const verifyApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const clientKey = req.header("x-api-key");
    const serverKey = process.env.API_KEY;

    if (!clientKey || clientKey !== serverKey) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
