import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const categoryController = {
  async getPublicCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.findAllPublic();

      return res.status(200).json({
        message: "Categorías obtenidas correctamente",
        data: categories,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener categorías";

      return res.status(500).json({
        message,
      });
    }
  },

  async getAdminCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.findAllAdmin();

      return res.status(200).json({
        message: "Categorías obtenidas correctamente",
        data: categories,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener categorías";

      return res.status(500).json({
        message,
      });
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de categoría inválido",
        });
      }

      const category = await categoryService.findById(id);

      return res.status(200).json({
        message: "Categoría obtenida correctamente",
        data: category,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener categoría";

      return res.status(404).json({
        message,
      });
    }
  },

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug;

      if (!slug || Array.isArray(slug)) {
        return res.status(400).json({
          message: "Slug de categoría inválido",
        });
      }

      const category = await categoryService.findBySlug(slug);

      return res.status(200).json({
        message: "Categoría obtenida correctamente",
        data: category,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener categoría";

      return res.status(404).json({
        message,
      });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "El nombre de la categoría es obligatorio",
        });
      }

      const category = await categoryService.create({
        name,
      });

      return res.status(201).json({
        message: "Categoría creada correctamente",
        data: category,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear categoría";

      return res.status(400).json({
        message,
      });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de categoría inválido",
        });
      }

      const { name, isActive } = req.body;

      const category = await categoryService.update(id, {
        name,
        isActive,
      });

      return res.status(200).json({
        message: "Categoría actualizada correctamente",
        data: category,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar categoría";

      return res.status(400).json({
        message,
      });
    }
  },

  async deactivateCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de categoría inválido",
        });
      }

      const category = await categoryService.deactivate(id);

      return res.status(200).json({
        message: "Categoría desactivada correctamente",
        data: category,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al desactivar categoría";

      return res.status(400).json({
        message,
      });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de categoría inválido",
        });
      }

      await categoryService.remove(id);

      return res.status(200).json({
        message: "Categoría eliminada correctamente",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar categoría";

      return res.status(400).json({
        message,
      });
    }
  },
};
