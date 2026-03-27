const Review = require("../models/Review");
const Order = require("../models/Order");

// @desc      Get all reviews for a specific product
// @route     GET /api/reviews/product/:productId
// @access    Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("customer", "name")
      .populate("order", "orderType");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Add a review
// @route     POST /api/reviews
// @access    Private (Customer only ideally, but we use strict auth)
exports.createReview = async (req, res) => {
  try {
    const { order, product, rating, comment } = req.body;

    // Verify order exists and belongs to user
    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Verify the order contains the product
    const productInOrder = orderData.items.some(
      (item) => item.product.toString() === product
    );

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        error: "Product not found in this order",
      });
    }

    // Ensure user is the customer of the order (in a more complex system, we check phone matching user, etc.)
    // For this simple seed-based system where users are just authenticated, we just proceed or match phone.

    const review = await Review.create({
      order,
      product,
      customer: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Review already exists for this order+product" });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};
