const router = require('express').Router();
const {
  getAllDiscussions,
  createDiscussion,
  addReply,
  getDiscussionById,
  deleteDiscussion
} = require("../controllers/DiscussionController");

router.get("/get-discussions", getAllDiscussions);
router.post("/get-discussions", createDiscussion);
router.post("/:id/reply", addReply);
router.delete("/:id", deleteDiscussion);
router.get("/:id", getDiscussionById);
module.exports = router;