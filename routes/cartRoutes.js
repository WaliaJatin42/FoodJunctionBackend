const express = require("express");
const {
  getCart,
  addToCart,
  checkout,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Customer ecommerce carts mapped to internal orders
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Retrieve your active shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active user cart details
 *   post:
 *     summary: Add product item to your cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart appended
 */
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router
  .route("/")
  .get(protect, getCart)
  .post(
    protect,
    [
      body("productId").notEmpty().withMessage("Product ID is required"),
      body("quantity")
        .optional()
        .isNumeric()
        .withMessage("Quantity must be numeric"),
    ],
    validateRequest,
    addToCart,
  );

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     summary: Simulate successful user payment and generate Kitchen Order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Global kitchen order dispatched
 */
router.route("/checkout").post(protect, [], validateRequest, checkout);

module.exports = router;
