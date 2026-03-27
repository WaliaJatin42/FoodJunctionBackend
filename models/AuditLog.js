const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    method: String,
    url: String,
    status: Number,
    responseTime: Number,
    ip: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    reqBody: Object,
    resBody: Object,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
