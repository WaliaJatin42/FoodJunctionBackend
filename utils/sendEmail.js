const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a reusable transporter using Ethereal's free testing STMP
  // In production this would be SendGrid or AWS SES
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465
    auth: {
      user: testAccount.user, // Generates a fake email natively
      pass: testAccount.pass, // Generates a fake credentials hash natively
    },
  });

  const message = {
    from: '"Food Junction Cafe" <noreply@foodjunction.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log("Message physically sent: %s", info.messageId);
  console.log(
    "Rendered Preview URL available logically: %s",
    nodemailer.getTestMessageUrl(info),
  );
};

module.exports = sendEmail;
