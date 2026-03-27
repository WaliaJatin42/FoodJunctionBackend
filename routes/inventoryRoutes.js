const express = require("express");
const {
  getInventory,
  createInventoryItem,
  restockItem,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Raw material and stock tracking
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all raw materials and their quantities
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of raw items
 *   post:
 *     summary: Add new raw material
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added
 */
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router
  .route("/")
  .get(protect, getInventory)
  .post(
    protect,
    [
      body("name").notEmpty().withMessage("Name is required"),
      body("quantity").isNumeric().withMessage("Quantity must be a number"),
      body("vendor").notEmpty().withMessage("Vendor ID is required"),
    ],
    validateRequest,
    createInventoryItem,
  );

/**
 * @swagger
 * /api/inventory/{id}/restock:
 *   put:
 *     summary: Restock raw material quantity
 *     tags: [Inventory]
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
 *               quantityAdded:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.route("/:id/restock").put(protect, restockItem);

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get single inventory item by ID
 *     tags: [Inventory]
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
 *         description: Item fetched
 *   put:
 *     summary: Update inventory item completely
 *     tags: [Inventory]
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
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               vendor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
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
 *         description: Item deleted
 */
router
  .route("/:id")
  .get(protect, getInventoryItem)
  .put(protect, updateInventoryItem)
  .delete(protect, deleteInventoryItem);

module.exports = router;
