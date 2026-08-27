import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "No tienes permisos para acceder a este recurso",
    });
  }

  next();
};
