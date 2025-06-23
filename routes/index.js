const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/chat", require("./chat"));
router.use("/discussion",require('./Discussion'));
router.use("/interview",require('./Interview'));

module.exports = router;