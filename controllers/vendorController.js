const Vendor = require("../models/Vendor");

// @desc      Get all vendors
// @route     GET /api/vendors
// @access    Private (Employee/Admin)
exports.getVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Vendor.countDocuments();
    const vendors = await Vendor.find().skip(startIndex).limit(limit);

    res.status(200).json({
      success: true,
      count: vendors.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: vendors,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Create new vendor
// @route     POST /api/vendors
// @access    Private (Employee/Admin)
exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single vendor
// @route     GET /api/vendors/:id
// @access    Private (Employee/Admin)
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, error: "Vendor not found" });
    res.status(200).json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update vendor
// @route     PUT /api/vendors/:id
// @access    Private (Employee/Admin)
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, error: "Vendor not found" });
    res.status(200).json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete vendor
// @route     DELETE /api/vendors/:id
// @access    Private (Admin Only)
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, error: "Vendor not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
