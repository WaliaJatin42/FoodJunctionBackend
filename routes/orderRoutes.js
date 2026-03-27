const express = require("express");
const {
  createOrder,
  getQueue,
  updateOrderStatus,
  getQueueStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Omnichannel Order management and true Queue tracking
 */

/**
 * @swagger
 * /api/orders/queue/status:
 *   get:
 *     summary: Get Real-time Queue Capacity and ETA Estimation
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Expected wait time and current active orders in kitchen
 */

// Public route for customers scanning QR code or looking at website
router.route("/queue/status").get(getQueueStatus);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (Cafe, Pickup, Delivery)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderType:
 *                 type: string
 *                 example: cafe
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *                 example: cash
 *     responses:
 *       201:
 *         description: Order created with Queue Position
 *
 * /api/orders/queue:
 *   get:
 *     summary: Display comprehensively structured active kitchen queue orders logically ordered
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System Array indexing active operational orders
 *
 * /api/orders/{id}/status:
 *   put:
 *     summary: Advance the live order status workflow (ex. preparing, completed)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       200:
 *         description: Workflow updated natively
 */

const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

// Protected routes for creation and queue management
router
  .route("/")
  .post(
    protect,
    [
      body("items")
        .isArray({ min: 1 })
        .withMessage("At least one item is required"),
      body("items.*.product").notEmpty().withMessage("Product ID is required"),
      body("items.*.quantity").isNumeric().withMessage("Quantity is required"),
    ],
    validateRequest,
    createOrder,
  );
router.route("/queue").get(protect, getQueue);
router.route("/:id/status").put(protect, updateOrderStatus);

module.exports = router;
