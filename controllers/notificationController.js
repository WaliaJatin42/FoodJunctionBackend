const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const path = require("path");

// @desc      Send bulk HTML notifications to all customers
// @route     POST /api/notifications/bulk
// @access    Private / Employee / Admin
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { subject, htmlBody } = req.body;

    // Fetch all explicitly registered 'customer' accounts
    const customers = await User.find({ role: "customer" });

    if (!customers || customers.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: "No customers found to externally notify.",
        });
    }

    // Determine the base URL dynamically for the 1x1 image tracker
    // Example: http://localhost:5000
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let notificationsSent = 0;

    for (const customer of customers) {
      // 1. Generate unique identifier string recursively
      const trackingId = crypto.randomBytes(16).toString("hex");

      // 2. Create tracking record in DB explicitly representing this specific email payload natively
      await Notification.create({
        customer: customer._id,
        trackingId,
        subject,
      });

      // 3. Inject the transparent tracking 1x1 graphical pixel explicitly at the end!
      const pixelTag = `<img src="${baseUrl}/api/notifications/track/${trackingId}" width="1" height="1" style="display:none;" />`;
      const finalHtmlPayload = `${htmlBody} \n\n ${pixelTag}`;

      // 4. Fire mock NodeMailer organically!
      try {
        await sendEmail({
          email: customer.email,
          subject,
          html: finalHtmlPayload,
        });
        notificationsSent++;
      } catch (emailErr) {
        console.error(
          "Mail Dispatch Failure for natively generated address:",
          customer.email,
          emailErr,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully logically dispatched HTML Tracking emails to ${notificationsSent} distinct customers in bulk!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Handle 1x1 Tracker HTTP Request invisibly
// @route     GET /api/notifications/track/:trackingId
// @access    Public
exports.trackEmailOpen = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const notification = await Notification.findOne({ trackingId });

    if (notification && notification.status !== "read") {
      // Transition state organically
      notification.status = "read";

      // Setting readAt dynamically invokes the sophisticated MongoDB TTL Index schema!
      // This instructs MongoDB internals to safely hard-delete this document exactly 2 minutes from Date.now()!
      notification.readAt = Date.now();

      await notification.save();
    }

    // Explicitly return a valid transparent 1x1 GIF mapping so the email client doesn't throw a "broken image" UX error graphic!
    const singlePixelBuf = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64",
    );

    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": singlePixelBuf.length,
    });
    res.end(singlePixelBuf);
  } catch (err) {
    console.error("Pixel Pipeline Processing Error:", err);
    res.status(500).send("Error generating pixel tracking stream");
  }
};
