const express = require("express");
const {
  getProductReviews,
  createReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product Review management API
 */

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of reviews
 */
router.route("/product/:productId").get(getProductReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Add a review for a product in an order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *               - product
 *               - rating
 *             properties:
 *               order:
 *                 type: string
 *                 description: ID of the order
 *               product:
 *                 type: string
 *                 description: ID of the product
 *               rating:
 *                 type: number
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.route("/").post(protect, authorize("customer"), createReview);

module.exports = router;
