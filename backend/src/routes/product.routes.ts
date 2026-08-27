import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/role.middleware";
import { uploadProductImage } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", productController.getPublicProducts);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  productController.getAdminProducts,
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  productController.getProductById,
);

router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  uploadProductImage.single("image"),
  productController.createProduct,
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  uploadProductImage.single("image"),
  productController.updateProduct,
);

router.patch(
  "/admin/:id/deactivate",
  authMiddleware,
  adminMiddleware,
  productController.deactivateProduct,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);

router.get("/:slug", productController.getProductBySlug);

export default router;
