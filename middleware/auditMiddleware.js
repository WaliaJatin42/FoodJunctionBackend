const AuditLog = require("../models/AuditLog");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configure Winston Logger
const transport = new DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const fileLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => JSON.stringify(info, null, 2))
  ),
  transports: [transport],
});

const auditMiddleware = (req, res, next) => {
  const start = Date.now();

  // Intercept res.send and res.json to capture response body
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody;

  res.json = function (data) {
    responseBody = data;
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    if (!responseBody) {
      try {
        responseBody = JSON.parse(data);
      } catch (e) {
        responseBody = { message: data };
      }
    }
    return originalSend.call(this, data);
  };

  res.on("finish", async () => {
    const responseTime = Date.now() - start;

    // Create log object
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime,
      ip: req.ip,
      user: req.user ? req.user.id : null,
      reqBody: req.body,
      resBody: responseBody,
    };

    // 1. Save to File rotation per day
    fileLogger.info(logData);

    // 2. Save to DB collection (Exclude swagger polling if preferred)
    try {
      if (!req.originalUrl.startsWith("/api-docs")) {
        await AuditLog.create(logData);
      }
    } catch (err) {
      console.error("AuditLog DB Save Error: ", err.message);
    }
  });

  next();
};

module.exports = auditMiddleware;
