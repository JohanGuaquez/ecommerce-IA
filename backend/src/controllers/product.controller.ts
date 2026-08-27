import { Request, Response } from "express";
import { productService } from "../services/product.service";

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isNaN(number) ? undefined : number;
};

const parseBoolean = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === "true" || value === true) {
    return true;
  }

  if (value === "false" || value === false) {
    return false;
  }

  return undefined;
};

export const productController = {
  async getPublicProducts(req: Request, res: Response) {
    try {
      const filters: {
        search?: string | undefined;
        category?: string | undefined;
        categoryId?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        available?: boolean | undefined;
      } = {};

      if (typeof req.query.search === "string" && req.query.search.trim()) {
        filters.search = req.query.search.trim();
      }

      if (typeof req.query.category === "string" && req.query.category.trim()) {
        filters.category = req.query.category.trim();
      }

      const categoryId = parseNumber(req.query.categoryId);
      if (categoryId !== undefined) {
        filters.categoryId = categoryId;
      }

      const minPrice = parseNumber(req.query.minPrice);
      if (minPrice !== undefined) {
        filters.minPrice = minPrice;
      }

      const maxPrice = parseNumber(req.query.maxPrice);
      if (maxPrice !== undefined) {
        filters.maxPrice = maxPrice;
      }

      const available = parseBoolean(req.query.available);
      if (available !== undefined) {
        filters.available = available;
      }

      const products = await productService.findAllPublic(filters);

      return res.status(200).json({
        message: "Productos obtenidos correctamente",
        data: products,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener productos";

      return res.status(500).json({
        message,
      });
    }
  },

  async getAdminProducts(req: Request, res: Response) {
    try {
      const products = await productService.findAllAdmin();

      return res.status(200).json({
        message: "Productos obtenidos correctamente",
        data: products,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener productos";

      return res.status(500).json({
        message,
      });
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      const product = await productService.findById(id);

      return res.status(200).json({
        message: "Producto obtenido correctamente",
        data: product,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener producto";

      return res.status(404).json({
        message,
      });
    }
  },

  async getProductBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug;

      if (!slug || typeof slug !== "string") {
        return res.status(400).json({
          message: "Slug de producto inválido",
        });
      }

      const product = await productService.findBySlug(slug);

      return res.status(200).json({
        message: "Producto obtenido correctamente",
        data: product,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener producto";

      return res.status(404).json({
        message,
      });
    }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const body = req.body ?? {};

      const { name, description, price, stock, categoryId } = body;

      if (
        !name ||
        !description ||
        !price ||
        stock === undefined ||
        !categoryId
      ) {
        return res.status(400).json({
          message:
            "Nombre, descripción, precio, stock y categoría son obligatorios",
        });
      }

      const parsedPrice = Number(price);
      const parsedStock = Number(stock);
      const parsedCategoryId = Number(categoryId);

      if (
        Number.isNaN(parsedPrice) ||
        Number.isNaN(parsedStock) ||
        Number.isNaN(parsedCategoryId)
      ) {
        return res.status(400).json({
          message: "Precio, stock y categoría deben ser valores válidos",
        });
      }

      const product = await productService.create({
        name,
        description,
        price: parsedPrice,
        stock: parsedStock,
        categoryId: parsedCategoryId,
        imageBuffer: req.file?.buffer,
      });

      return res.status(201).json({
        message: "Producto creado correctamente",
        data: product,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear producto";

      return res.status(400).json({
        message,
      });
    }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      const body = req.body ?? {};

      const { name, description, price, stock, categoryId, status } = body;

      if (status && status !== "ACTIVE" && status !== "INACTIVE") {
        return res.status(400).json({
          message: "Estado de producto inválido",
        });
      }

      const productData: {
        name?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        stock?: number | undefined;
        categoryId?: number | undefined;
        status?: "ACTIVE" | "INACTIVE" | undefined;
        imageBuffer?: Buffer | undefined;
      } = {};

      if (typeof name === "string" && name.trim()) {
        productData.name = name;
      }

      if (typeof description === "string" && description.trim()) {
        productData.description = description;
      }

      if (price !== undefined && price !== "") {
        const parsedPrice = Number(price);

        if (Number.isNaN(parsedPrice)) {
          return res.status(400).json({
            message: "El precio debe ser un número válido",
          });
        }

        productData.price = parsedPrice;
      }

      if (stock !== undefined && stock !== "") {
        const parsedStock = Number(stock);

        if (Number.isNaN(parsedStock)) {
          return res.status(400).json({
            message: "El stock debe ser un número válido",
          });
        }

        productData.stock = parsedStock;
      }

      if (categoryId !== undefined && categoryId !== "") {
        const parsedCategoryId = Number(categoryId);

        if (Number.isNaN(parsedCategoryId)) {
          return res.status(400).json({
            message: "La categoría debe ser válida",
          });
        }

        productData.categoryId = parsedCategoryId;
      }

      if (status === "ACTIVE" || status === "INACTIVE") {
        productData.status = status;
      }

      if (req.file?.buffer) {
        productData.imageBuffer = req.file.buffer;
      }

      const product = await productService.update(id, productData);

      return res.status(200).json({
        message: "Producto actualizado correctamente",
        data: product,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar producto";

      return res.status(400).json({
        message,
      });
    }
  },

  async deactivateProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      const product = await productService.deactivate(id);

      return res.status(200).json({
        message: "Producto desactivado correctamente",
        data: product,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al desactivar producto";

      return res.status(400).json({
        message,
      });
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      await productService.remove(id);

      return res.status(200).json({
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar producto";

      return res.status(400).json({
        message,
      });
    }
  },
};
