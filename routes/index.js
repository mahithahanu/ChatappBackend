const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/chat", require("./chat"));
router.use("/discussion",require('./Discussion'));
router.use("/interview",require('./Interview'));
router.use('/clubs',require('./clubRoutes'));
router.use('/communities',require('./cummunityRoutes'));
router.use('/clubschat',require('./clubChat'));
router.use('/send',require('./clubMessageRoute'));


module.exports = router;