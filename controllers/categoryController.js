const Category = require("../models/Category");

// @desc      Get all categories
// @route     GET /api/categories
// @access    Public / Employee / Admin
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Category.countDocuments();
    const categories = await Category.find().skip(startIndex).limit(limit);

    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: categories,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Create new category
// @route     POST /api/categories
// @access    Private / Admin
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single category
// @route     GET /api/categories/:id
// @access    Public / Employee / Admin
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update category
// @route     PUT /api/categories/:id
// @access    Private / Admin / Employee
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete category
// @route     DELETE /api/categories/:id
// @access    Private / Admin / Employee
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
