const router = require("express").Router();

const authController = require("../controllers/authController");

const sendContactEmail=require("../controllers/contactController");

router.post("/login", authController.login);

router.post("/register", authController.register, authController.sendOTP);
router.post("/verify", authController.verifyOTP);
router.post("/send-otp", authController.sendOTP);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/contact", sendContactEmail.sendContactEmail);

module.exports = router;
