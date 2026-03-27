const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  sendBulkNotifications,
  trackEmailOpen,
} = require("../controllers/notificationController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Bulk HTML email pipelines and implicit tracking ecosystem
 */

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Dispatch complex HTML email structures externally to all registered customers with tracking
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               htmlBody:
 *                 type: string
 *     responses:
 *       200:
 *         description: External emails dispatched safely
 */
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router.post(
  "/bulk",
  protect,
  authorize("admin", "employee"),
  [
    body("subject")
      .notEmpty()
      .withMessage("Subject string is critically required"),
    body("htmlBody")
      .notEmpty()
      .withMessage("Strict HTML markup Body is required"),
  ],
  validateRequest,
  sendBulkNotifications,
);

/**
 * @swagger
 * /api/notifications/track/{trackingId}:
 *   get:
 *     summary: Implicit silent tracking endpoint serving transparent 1x1 pixels
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Base64 graphical Buffer stream intrinsically representing a 1x1 transparent image mapping
 */
router.get("/track/:trackingId", trackEmailOpen);

module.exports = router;
