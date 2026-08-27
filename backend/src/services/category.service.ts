import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generateSlug";

type CreateCategoryData = {
  name: string;
};

type UpdateCategoryData = {
  name?: string;
  isActive?: boolean;
};

export const categoryService = {
  async findAllPublic() {
    return prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async findAllAdmin() {
    return prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Categoría no encontrada");
    }

    return category;
  },

  async findBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        products: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new Error("Categoría no encontrada");
    }

    return category;
  },

  async create(data: CreateCategoryData) {
    const name = data.name.trim();

    if (!name) {
      throw new Error("El nombre de la categoría es obligatorio");
    }

    const slug = generateSlug(name);

    const categoryExists = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (categoryExists) {
      throw new Error("Ya existe una categoría con ese nombre");
    }

    return prisma.category.create({
      data: {
        name,
        slug,
      },
    });
  },

  async update(id: number, data: UpdateCategoryData) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new Error("Categoría no encontrada");
    }

    let slug = category.slug;
    let name = category.name;

    if (data.name) {
      name = data.name.trim();
      slug = generateSlug(name);

      const categoryExists = await prisma.category.findFirst({
        where: {
          OR: [{ name }, { slug }],
          NOT: {
            id,
          },
        },
      });

      if (categoryExists) {
        throw new Error("Ya existe otra categoría con ese nombre");
      }
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        isActive:
          typeof data.isActive === "boolean"
            ? data.isActive
            : category.isActive,
      },
    });
  },

  async deactivate(id: number) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Categoría no encontrada");
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  },

  async remove(id: number) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Categoría no encontrada");
    }

    if (category._count.products > 0) {
      throw new Error(
        "No se puede eliminar la categoría porque tiene productos asociados. Puedes desactivarla.",
      );
    }

    return prisma.category.delete({
      where: {
        id,
      },
    });
  },
};
