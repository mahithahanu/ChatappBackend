require("dotenv").config(); // ✅ First load the env vars

console.log("✅ Loaded SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY?.slice(0, 10));

const sgMail = require("@sendgrid/mail");

// ✅ Set API key AFTER loading it
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: "chikkalamahitha.40319@gmail.com",             // ✅ Receiver
  from: "22A91A05B2@aec.edu.in",           // ✅ Must be verified sender in SendGrid
  subject: "Test Email from SendGrid",
  text: "This is a test email using SendGrid and Node.js!",
};

sgMail
  .send(msg)
  .then(() => {
    console.log("✅ Email sent successfully");
  })
  .catch((error) => {
    console.error("❌ SendGrid error:", error.response?.body?.errors || error.message);
  });
