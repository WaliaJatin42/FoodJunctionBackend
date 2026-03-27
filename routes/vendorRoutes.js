const express = require("express");
const {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Supplier management API
 */

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all suppliers and their contact details
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suppliers
 *   post:
 *     summary: Add a new vendor/supplier
 *     tags: [Vendors]
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
 *               phone:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor created
 */
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

router
  .route("/")
  .get(protect, getVendors)
  .post(
    protect,
    [
      body("name").notEmpty().withMessage("Vendor name is required"),
      body("phone").notEmpty().withMessage("Phone is required"),
    ],
    validateRequest,
    createVendor,
  );

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get single vendor by ID
 *     tags: [Vendors]
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
 *         description: Vendor fetched
 *   put:
 *     summary: Update vendor details
 *     tags: [Vendors]
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
 *               phone:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor updated
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendors]
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
 *         description: Vendor deleted
 */
router
  .route("/:id")
  .get(protect, getVendor)
  .put(protect, authorize("admin", "employee"), updateVendor)
  .delete(protect, authorize("admin", "employee"), deleteVendor);

module.exports = router;
