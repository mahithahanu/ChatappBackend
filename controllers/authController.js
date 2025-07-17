const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailService = require("../services/mailer");
const crypto = require("crypto");

const filterObj = require("../utils/filterObj");
const User = require("../models/user");
const otp = require("../Templates/Mail/otp");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

function generateRandomPassword() {
  return crypto.randomBytes(4).toString("hex");
}

// ========================== REGISTER ==========================
exports.register = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email", "password");
  const existing_user = await User.findOne({ email: req.body.email });

  if (existing_user && existing_user.verified) {
    return res.status(400).json({ status: "error", message: "Email already in use, Please login." });
  } else if (existing_user) {
    Object.assign(existing_user, filteredBody);
    await existing_user.save();
    req.userId = existing_user._id;
    next();
  } else {
    const new_user = await User.create(filteredBody);
    req.userId = new_user._id;
    next();
  }
});

// ========================== SEND OTP ==========================
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
  const otp_expiry_time = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(userId, { otp_expiry_time });
  user.otp = new_otp.toString();
  await user.save({ new: true, validateModifiedOnly: true });

  mailService.sendEmail({
    from: "22A91A05B2@aec.edu.in",
    to: user.email,
    subject: "Verification OTP",
    html: otp(user.firstName, new_otp),
    attachments: [],
  });

  res.status(200).json({ status: "success", message: "OTP Sent Successfully!" });
});

// ========================== VERIFY OTP ==========================
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp_expiry_time: { $gt: Date.now() } });

  if (!user) return res.status(400).json({ status: "error", message: "Email is invalid or OTP expired" });
  if (user.verified) return res.status(400).json({ status: "error", message: "Email is already verified" });
  if (!(await user.correctOTP(otp, user.otp))) return res.status(400).json({ status: "error", message: "OTP is incorrect" });

  user.verified = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);
  res.status(200).json({ status: "success", message: "OTP verified Successfully!", token, user_id: user._id });
});

// ========================== LOGIN ==========================
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ status: "error", message: "Both email and password are required" });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) return res.status(400).json({ status: "error", message: "Incorrect password" });
  if (!(await user.correctPassword(password, user.password))) return res.status(400).json({ status: "error", message: "Email or password is incorrect" });

  const token = signToken(user._id);
  res.status(200).json({ status: "success", message: "Logged in successfully!", token, user_id: user._id, email:user.email,   isAdmin: user.isAdmin, });
});

// ========================== PROTECT MIDDLEWARE ==========================
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return res.status(401).json({ message: "You are not logged in! Please log in to get access." });

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const this_user = await User.findById(decoded.userId);
  if (!this_user) return res.status(401).json({ message: "The user belonging to this token does no longer exist." });
  if (this_user.changedPasswordAfter(decoded.iat)) return res.status(401).json({ message: "User recently changed password! Please log in again." });

  req.user = this_user;
  next();
});

// ========================== FORGOT PASSWORD ==========================
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ status: "error", message: "No user found with this email." });

  // Generate raw token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash and store token
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send raw token in email
  const resetURL = `http://localhost:3000/login/new-password?token=${resetToken}`;

  try {
    await mailService.sendEmail({
      from: "22A91A05B2@aec.edu.in",
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password. This link will expire in 10 minutes.</p>
        <p><a href="${resetURL}">${resetURL}</a></p>
        <p>If you didn’t request this, just ignore this email.</p>
      `,
    });

    res.status(200).json({ status: "success", message: "Password reset link sent to email!" });
  } catch (err) {
    console.error("Email sending failed:", err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({ status: "error", message: "Failed to send email. Try again later." });
  }
});

// ========================== RESET PASSWORD ==========================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ status: "error", message: "Token is Invalid or Expired" });

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({ status: "success", message: "Password Reset Successfully", token });
});
