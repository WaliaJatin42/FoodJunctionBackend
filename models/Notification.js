const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "read"],
      default: "sent",
    },
    readAt: {
      type: Date,
      // TTL Index: Deletes document exactly 120 seconds (2 mins) after this timestamp is mathematically populated
      expires: "2m",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
