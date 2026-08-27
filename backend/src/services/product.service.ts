import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generateSlug";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary";

type CreateProductData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageBuffer?: Buffer | undefined;
};

type UpdateProductData = {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  stock?: number | undefined;
  categoryId?: number | undefined;
  status?: "ACTIVE" | "INACTIVE" | undefined;
  imageBuffer?: Buffer | undefined;
};

type ProductFilters = {
  search?: string | undefined;
  category?: string | undefined;
  categoryId?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  available?: boolean | undefined;
};

export const productService = {
  async findAllPublic(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (filters.category) {
      where.category = {
        slug: filters.category,
        isActive: true,
      };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};

      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (typeof filters.available === "boolean") {
      where.stock = filters.available ? { gt: 0 } : { equals: 0 };
    }

    return prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  async findAllAdmin() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    return product;
  },

  async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new Error("Producto no encontrado");
    }

    return product;
  },

  async create(data: CreateProductData) {
    const name = data.name.trim();
    const description = data.description.trim();

    if (!name) {
      throw new Error("El nombre del producto es obligatorio");
    }

    if (!description) {
      throw new Error("La descripción del producto es obligatoria");
    }

    if (data.price <= 0) {
      throw new Error("El precio debe ser mayor a cero");
    }

    if (data.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category || !category.isActive) {
      throw new Error("La categoría no existe o está inactiva");
    }

    const slug = generateSlug(name);

    const productExists = await prisma.product.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (productExists) {
      throw new Error("Ya existe un producto con ese nombre");
    }

    let imageUrl: string | null = null;

    if (data.imageBuffer) {
      const uploadResult = await uploadBufferToCloudinary(data.imageBuffer);
      imageUrl = uploadResult.secure_url;
    }

    return prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: data.price,
        stock: data.stock,
        imageUrl,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });
  },

  async update(id: number, data: UpdateProductData) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    let name = product.name;
    let slug = product.slug;

    if (data.name) {
      name = data.name.trim();
      slug = generateSlug(name);

      const productExists = await prisma.product.findFirst({
        where: {
          OR: [{ name }, { slug }],
          NOT: {
            id,
          },
        },
      });

      if (productExists) {
        throw new Error("Ya existe otro producto con ese nombre");
      }
    }

    if (data.description !== undefined && !data.description.trim()) {
      throw new Error("La descripción no puede estar vacía");
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new Error("El precio debe ser mayor a cero");
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    if (data.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category || !category.isActive) {
        throw new Error("La categoría no existe o está inactiva");
      }
    }

    let imageUrl: string | null = product.imageUrl;

    if (data.imageBuffer) {
      const uploadResult = await uploadBufferToCloudinary(data.imageBuffer);
      imageUrl = uploadResult.secure_url;
    }

    return prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description:
          data.description !== undefined
            ? data.description.trim()
            : product.description,
        price: data.price !== undefined ? data.price : product.price,
        stock: data.stock !== undefined ? data.stock : product.stock,
        categoryId:
          data.categoryId !== undefined ? data.categoryId : product.categoryId,
        status: data.status !== undefined ? data.status : product.status,
        imageUrl,
      },
      include: {
        category: true,
      },
    });
  },

  async deactivate(id: number) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    return prisma.product.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
      },
    });
  },

  async remove(id: number) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (product._count.orderItems > 0 || product._count.cartItems > 0) {
      throw new Error(
        "No se puede eliminar el producto porque tiene movimientos asociados. Puedes desactivarlo.",
      );
    }

    return prisma.product.delete({
      where: {
        id,
      },
    });
  },
};
