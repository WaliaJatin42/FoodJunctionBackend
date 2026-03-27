const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc Get customer cart
// @route GET /api/cart
// @access Private (Customer)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalAmount: 0,
      });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc Add item to cart
// @route POST /api/cart
// @access Private (Customer)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let [cart, product] = await Promise.all([
      Cart.findOne({ user: req.user.id }),
      Product.findById(productId),
    ]);

    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    if (!cart)
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalAmount: 0,
      });

    const itemIndex = cart.items.findIndex(
      (p) => p.product.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        price: product.price,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc Simulate payment and generate Order
// @route POST /api/cart/checkout
// @access Private (Customer)
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    const orderItems = cart.items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      price: i.price,
      customizations: [],
    }));

    // Convert cart explicitly into the global Kitchen Queue tracking schema
    const order = await Order.create({
      employee: req.user.id, // Using global auth ID
      orderType: "online_pickup",
      items: orderItems,
      totalAmount: cart.totalAmount,
      paymentMethod: "online",
      paymentStatus: "paid", // Simulating successful Razorpay webhook
      status: "received",
    });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
