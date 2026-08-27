import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", categoryController.getPublicCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  categoryController.getAdminCategories,
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.getCategoryById,
);

router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  categoryController.createCategory,
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.updateCategory,
);

router.patch(
  "/admin/:id/deactivate",
  authMiddleware,
  adminMiddleware,
  categoryController.deactivateCategory,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory,
);

export default router;
