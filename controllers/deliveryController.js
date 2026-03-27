const Delivery = require("../models/Delivery");
const Order = require("../models/Order");

// @desc      Get all assigned deliveries for a user
// @route     GET /api/deliveries/me
// @access    Private
exports.getMyDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { deliveryBoy: req.user.id };
    const total = await Delivery.countDocuments(query);

    const deliveries = await Delivery.find(query)
      .skip(startIndex)
      .limit(limit)
      .populate("order", "totalAmount customerPhone deliveryAddress eta");

    res.status(200).json({
      success: true,
      count: deliveries.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: deliveries,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Assign delivery to self
// @route     POST /api/deliveries/:orderId/assign
// @access    Private
exports.assignDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });
    if (order.orderType !== "delivery") {
      return res
        .status(400)
        .json({ success: false, error: "Order is not for delivery" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let delivery = await Delivery.findOne({ order: order._id });
    if (delivery && delivery.deliveryBoy) {
      return res
        .status(400)
        .json({ success: false, error: "Delivery already assigned" });
    }

    if (!delivery) {
      delivery = await Delivery.create({
        order: order._id,
        deliveryBoy: req.user.id,
        status: "assigned",
        otp,
        eta: order.eta,
      });
    } else {
      delivery.deliveryBoy = req.user.id;
      delivery.status = "assigned";
      await delivery.save();
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update delivery status (e.g., delivered verifies OTP)
// @route     PUT /api/deliveries/:id/status
// @access    Private
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery)
      return res
        .status(404)
        .json({ success: false, error: "Delivery not found" });

    if (status === "delivered") {
      if (delivery.otp !== otp) {
        return res.status(400).json({ success: false, error: "Invalid OTP" });
      }
    }

    delivery.status = status;
    await delivery.save();

    res.status(200).json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get all deliveries
// @route     GET /api/deliveries
// @access    Private / Admin / Employee
exports.getDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Delivery.countDocuments();
    const deliveries = await Delivery.find()
      .skip(startIndex)
      .limit(limit)
      .populate("order")
      .populate("deliveryBoy", "name email");

    res.status(200).json({
      success: true,
      count: deliveries.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: deliveries,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single delivery
// @route     GET /api/deliveries/:id
// @access    Private
exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("order")
      .populate("deliveryBoy", "name email");
    if (!delivery)
      return res
        .status(404)
        .json({ success: false, error: "Delivery not found" });
    res.status(200).json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete delivery (Only after delivered)
// @route     DELETE /api/deliveries/:id
// @access    Private / Admin
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      return res
        .status(404)
        .json({ success: false, error: "Delivery not found" });

    if (delivery.status !== "delivered") {
      return res
        .status(400)
        .json({
          success: false,
          error: "Cannot delete active deliveries. Must be marked delivered.",
        });
    }

    await delivery.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
