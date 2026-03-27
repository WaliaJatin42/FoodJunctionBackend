const User = require("../models/User");

// @desc      Get all users (employees/admins)
// @route     GET /api/users
// @access    Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().skip(startIndex).limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: users,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single user
// @route     GET /api/users/:id
// @access    Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Create user
// @route     POST /api/users
// @access    Private/Admin
exports.createUser = async (req, res) => {
  try {
    // Relying on the User.pre('save') hook to hash the password securely
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update user
// @route     PUT /api/users/:id
// @access    Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Avoid findByIdAndUpdate to ensure mongoose pre-save hook acts on password changes if provided
    let user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    Object.assign(user, req.body);
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete user
// @route     DELETE /api/users/:id
// @access    Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
