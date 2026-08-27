import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Nombre, correo y contraseña son obligatorios",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener mínimo 6 caracteres",
        });
      }

      const result = await authService.register({
        name,
        email,
        password,
        phone,
      });

      return res.status(201).json({
        message: "Usuario registrado correctamente",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar usuario";

      return res.status(400).json({
        message,
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Correo y contraseña son obligatorios",
        });
      }

      const result = await authService.login({
        email,
        password,
      });

      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      return res.status(401).json({
        message,
      });
    }
  },

  async profile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }

      const user = await authService.profile(req.user.id);

      return res.status(200).json({
        message: "Perfil obtenido correctamente",
        data: user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener perfil";

      return res.status(400).json({
        message,
      });
    }
  },
};
