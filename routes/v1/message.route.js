const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/message.controller");
const isAuth = require("../../middlewares/isAuth");

// Send message (to group or one-to-one)
router.post("/", isAuth, messageController.sendMessage);

// Get messages from a conversation (group or one-to-one)
router.get(
  "/conversation/:conversationId",
  isAuth,
  messageController.getMessages
);

// Get all conversations for current user
router.get("/conversations", isAuth, messageController.getConversations);

// ✅ Group routes
router.post("/group/create", isAuth, messageController.createGroupChat);
router.put("/group/rename", isAuth, messageController.renameGroup);
router.put("/group/add", isAuth, messageController.addToGroup);
router.put("/group/remove", isAuth, messageController.removeFromGroup);

module.exports = router;
