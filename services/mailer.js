require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// console.log("API KEY (debug):", process.env.SENDGRID_API_KEY);

const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const from = "22A91A05B2@aec.edu.in"; // Use your verified sender

    const msg = {
      to: to,          // ✅ Corrected
      from: from,
      subject: subject,
      html: html,
      attachments: attachments || [],
    };

    return sgMail.send(msg);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
  }
};

exports.sendEmail = async (args) => {
  // In development mode, don't send real email
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};
