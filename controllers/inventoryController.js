const InventoryItem = require("../models/InventoryItem");

// @desc      Get all inventory items (raw materials)
// @route     GET /api/inventory
// @access    Private (Employee/Admin)
exports.getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await InventoryItem.countDocuments();
    const inventory = await InventoryItem.find()
      .populate("vendor", "name phone email")
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: inventory.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: inventory,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Add new inventory item
// @route     POST /api/inventory
// @access    Private (Employee/Admin)
exports.createInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update stock level (Received stock from vendor)
// @route     PUT /api/inventory/:id/restock
// @access    Private (Employee/Admin)
exports.restockItem = async (req, res) => {
  try {
    const { quantityAdded } = req.body;
    let item = await InventoryItem.findById(req.params.id);

    if (!item)
      return res.status(404).json({ success: false, error: "Item not found" });

    item.quantity += quantityAdded;
    item.lastRestocked = Date.now();
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single inventory item
// @route     GET /api/inventory/:id
// @access    Private (Employee/Admin)
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id).populate(
      "vendor",
      "name phone",
    );
    if (!item)
      return res.status(404).json({ success: false, error: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update inventory item
// @route     PUT /api/inventory/:id
// @access    Private (Employee/Admin)
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!item)
      return res.status(404).json({ success: false, error: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete inventory item
// @route     DELETE /api/inventory/:id
// @access    Private (Employee/Admin)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, error: "Item not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
