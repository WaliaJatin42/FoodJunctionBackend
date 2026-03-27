const express = require("express");
const {
  getMyDeliveries,
  assignDelivery,
  updateDeliveryStatus,
  getDeliveries,
  getDelivery,
  deleteDelivery,
} = require("../controllers/deliveryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery tracking and OTP API
 */

/**
 * @swagger
 * /api/deliveries/me:
 *   get:
 *     summary: Get assigned deliveries for the logged in driver
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active assignments
 *
 * /api/deliveries/{orderId}/assign:
 *   post:
 *     summary: Assign self to a delivery order
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment successful, OTP generated
 *
 * /api/deliveries/{id}/status:
 *   put:
 *     summary: Verify OTP and complete delivery
 *     tags: [Deliveries]
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
 *         description: Status updated
 */

const { param } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router.route("/me").get(protect, getMyDeliveries);
router
  .route("/:orderId/assign")
  .post(
    protect,
    [param("orderId").notEmpty().withMessage("Order ID parameter is required")],
    validateRequest,
    assignDelivery,
  );
router.route("/:id/status").put(protect, updateDeliveryStatus);

/**
 * @swagger
 * /api/deliveries:
 *   get:
 *     summary: Get all system deliveries
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deliveries
 *
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get single delivery
 *     tags: [Deliveries]
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
 *         description: Delivery object
 *   delete:
 *     summary: Delete a delivery (Only allowed if status is delivered)
 *     tags: [Deliveries]
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
 *         description: Delivery deleted successfully
 */
router.route("/").get(protect, authorize("admin", "employee"), getDeliveries);

router
  .route("/:id")
  .get(protect, getDelivery)
  .delete(protect, authorize("admin"), deleteDelivery);

module.exports = router;
