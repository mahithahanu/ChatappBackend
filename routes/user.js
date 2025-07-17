const router = require("express").Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post(
  "/generate-zego-token",
  authController.protect,
  userController.generateZegoToken
);
router.get("/get-call-logs", authController.protect, userController.getCallLogs);
// router.get("/get-me", authController.protect, userController.getMe);
router.patch("/update-me", authController.protect, userController.updateMe);
router.get("/get-all-verified-users", authController.protect, userController.getAllVerifiedUsers);
router.get("/get-users", authController.protect, userController.getUsers);
router.get("/get-friends", authController.protect, userController.getFriends);
router.get("/get-friend-requests", authController.protect, userController.getRequests);

router.get("/get-call-status/:id", authController.protect, userController.getCallStatus);

router.post("/start-audio-call", authController.protect, userController.startAudioCall);
router.post("/start-video-call", authController.protect, userController.startVideoCall);
// In your routes file
router.post("/end-call", authController.protect, userController.endCall);



module.exports = router;
