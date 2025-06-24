const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user"); // adjust path as needed
const mailService = require("../services/mailer");

function generateRandomPassword() {
  return crypto.randomBytes(4).toString("hex"); // 8 characters
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Check if user exists
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "There is no user with that email address.",
    });
  }

  // 2. Generate random password
  const newPassword = generateRandomPassword();

  // 3. Set new password and save
  user.password = newPassword;
  user.passwordConfirm = newPassword;

  await user.save(); // make sure you have a pre-save bcrypt hook

  // 4. Send email with new password
  try {
    await mailService.sendEmail({
      from: "22A91A05B2@aec.edu.in", // or use process.env.EMAIL_USER
      to: user.email,
      subject: "Your New Login Password",
      html: `
        <p>Hello ${user.firstName || "User"},</p>
        <p>Your new login password is: <strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately for security.</p>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "New password sent to your email.",
    });
  } catch (err) {
    console.error("Error sending mail:", err);
    return res.status(500).json({
      status: "error",
      message: "Could not send the email. Please try again later.",
    });
  }
});
