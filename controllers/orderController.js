const Order = require("../models/Order");
const Product = require("../models/Product");

// Helper to get socket.io instance from the Express app
const getIo = (req) => req.app.get("io");

// @desc      Create new order & assign queue position
// @route     POST /api/orders
// @access    Private (Employee/Admin/Customer via app)
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      orderType,
      customerPhone,
      deliveryAddress,
      vip,
    } = req.body;

    let totalAmount = 0;

    // Verify products and calculate total
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: `Product ${item.product} not found` });
      }

      let itemTotal = product.price;

      // Calculate addons from customizations
      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach((cust) => {
          if (cust.priceAddOn) itemTotal += cust.priceAddOn;
        });
      }

      totalAmount += itemTotal * item.quantity;
    }

    // Determine current max queue position
    const activeOrders = await Order.find({
      status: { $in: ["received", "preparing"] },
    }).sort("queuePosition");

    let queuePosition = 1;
    const type = orderType || "cafe";

    if (activeOrders.length > 0) {
      if (type === "cafe" || type === "table_qr" || vip) {
        // Cafe/Table and VIP orders get appended to current "live" queue priority slot
        const maxCurrent = Math.max(
          ...activeOrders.map((o) => o.queuePosition || 0),
        );
        queuePosition = maxCurrent + 1;
      } else if (type === "online_pickup" || type === "delivery") {
        // Online pickup and delivery orders are placed sequentially but could be buffered
        const maxCurrent = Math.max(
          ...activeOrders.map((o) => o.queuePosition || 0),
        );
        queuePosition = maxCurrent + 1;
      }
    }

    // Estimate ETA based on queue size (standard heuristic: 5 mins per active order)
    const estimatedMinutes = activeOrders.length * 5;
    const eta = new Date(new Date().getTime() + estimatedMinutes * 60000);

    const order = await Order.create({
      employee: req.user ? req.user.id : null,
      orderType: type,
      customerPhone,
      deliveryAddress,
      eta,
      items,
      totalAmount,
      paymentMethod,
      vip: vip || false,
      queuePosition,
    });

    // Emmit socket event to notify kitchen and other employees of the new order
    getIo(req).emit("newOrder", order);

    res.status(201).json({ success: true, data: order, eta });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get all active orders (Kitchen Queue)
// @route     GET /api/orders/queue
// @access    Private
exports.getQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page_size, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { status: { $in: ["received", "preparing"] } };
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort("queuePosition")
      .skip(startIndex)
      .limit(limit)
      .populate("items.product", "name price")
      .populate("employee", "name role");

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        page_size: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
      data: orders,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update order status (Moving it along the workflow)
// @route     PUT /api/orders/:id/status
// @access    Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;

    // If order completes, shift all other active orders' queue positions down
    if (status === "completed" && previousStatus !== "completed") {
      const removedPosition = order.queuePosition;
      order.queuePosition = null; // Removed from queue
      await order.save();

      if (removedPosition) {
        await Order.updateMany(
          {
            queuePosition: { $gt: removedPosition },
            status: { $in: ["received", "preparing"] },
          },
          { $inc: { queuePosition: -1 } },
        );
      }

      getIo(req).emit("queueUpdated");
    } else {
      await order.save();
    }

    getIo(req).emit("orderStatusChanged", order);

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get Real-time Queue Capacity Endpoint
// @route     GET /api/orders/queue/status
// @access    Public
exports.getQueueStatus = async (req, res) => {
  try {
    // Basic capacity logic: 5 minutes per order avg
    const activeOrders = await Order.countDocuments({
      status: { $in: ["received", "preparing"] },
    });
    const waitTimeMinutes = activeOrders * 5;

    const nextSlot = new Date(new Date().getTime() + waitTimeMinutes * 60000);

    res.status(200).json({
      success: true,
      data: {
        activeOrders,
        waitTimeMinutes,
        nextSlotAvailable: nextSlot,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
