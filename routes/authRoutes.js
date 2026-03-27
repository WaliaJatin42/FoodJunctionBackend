const express = require("express");
const {
  register,
  login,
  getMe,
  refreshToken,
  googleLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT Token
 *       400:
 *         description: Invalid Credentials
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new Employee or Admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: employee
 *     responses:
 *       201:
 *         description: Registered successfully
 */

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Generate a new 24h access token using an active 7d refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New accessToken issued
 *       401:
 *         description: Refresh token invalid or expired
 *
 * /api/auth/google:
 *   post:
 *     summary: Login or Register seamlessly via Google App Integration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT Token pairs
 *       401:
 *         description: Invalid Google Access payload
 */
router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  validateRequest,
  refreshToken,
);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ],
  validateRequest,
  login,
);

router.post(
  "/google",
  [body("idToken").notEmpty().withMessage("Google ID token is required")],
  validateRequest,
  googleLogin,
);

router.get("/me", protect, getMe);

module.exports = router;
