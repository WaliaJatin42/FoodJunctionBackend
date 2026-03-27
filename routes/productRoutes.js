const express = require("express");
const {
  getProducts,
  createProduct,
  updateStock,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Coffee and Food Product management API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all available products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of products
 *   post:
 *     summary: Create new product & customizations (Admin Only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created
 *
 * /api/products/{id}/stock:
 *   put:
 *     summary: Update stock level manually
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock updated
 */

const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router
  .route("/")
  .get(protect, getProducts)
  .post(
    protect,
    authorize("admin", "employee"),
    [
      body("name").notEmpty().withMessage("Product name is required"),
      body("price").isNumeric().withMessage("Valid price is required"),
      body("category").notEmpty().withMessage("Category ID is required"),
    ],
    validateRequest,
    createProduct,
  );

router
  .route("/:id/stock")
  .put(protect, authorize("admin", "employee"), updateStock);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched
 *   put:
 *     summary: Update product details completely
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router
  .route("/:id")
  .get(protect, getProduct)
  .put(protect, authorize("admin", "employee"), updateProduct)
  .delete(protect, authorize("admin", "employee"), deleteProduct);

module.exports = router;
