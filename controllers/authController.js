const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Helper to generate access token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h", // 24 hours validity
  });
};

// Helper to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || "supersecretrefreshkey123",
    {
      expiresIn: "7d", // 7 days validity
    },
  );
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  // Store refresh token directly in DB
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
    },
  });
};

// @desc      Register public customer (Admins create employees via /api/users exclusively now)
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role: "customer", // Hardcoded safely to prevent privilege escalation via public routes
      branch: "Online",
    });

    await sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get new access token from refresh token
// @route     POST /api/auth/refresh-token
// @access    Public
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a refresh token" });
    }

    // Verify token exists statically in the DB
    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid refresh token" });
    }

    // Validate the actual JSON Web Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "supersecretrefreshkey123",
    );

    // Generate fresh 24h access token
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "Refresh token validation failed or expired",
    });
  }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Login or Register via Google Dashboard Integration
// @route     POST /api/auth/google
// @access    Public
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the payload directly with Google
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString("hex") + "A1!", // Secure complex arbitrary string
        role: "customer", // Forces default strict safety privilege
        branch: "Online",
      });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    res
      .status(401)
      .json({ success: false, error: "Invalid Google Token Authorization" });
  }
};
