const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const { getRecipientSocketId, io } = require("../socket/socket");
const cloudinary = require("cloudinary").v2;

const createGroupChat = async ({ name, participants, creatorId }) => {
  try {
    const conversation = new Conversation({
      isGroup: true,
      name,
      participants: [...new Set([...participants, creatorId])],
    });
    await conversation.save();
    return conversation;
  } catch (error) {
    console.error("Group Chat Creation Error:", error);
    return null;
  }
};


const findConversation = async (userId, otherUserId) => {
  try {
    const conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [userId, otherUserId] },
    }).populate("participants", "username profilePic");

    return conversation;
  } catch (error) {
    console.error("findConversation error:", error);
    return null;
  }
};


const sendMessage = async ({ recipientId, conversationId, message, senderId, img }) => {
  try {
    let conversation;

    // conversationId valid ရှိရင် conversation ရှာမယ်
    if (conversationId && conversationId.trim() !== "") {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new Error("Conversation not found");
    } else {
      // conversationId မရှိရင် one-to-one conversation ရှာမယ်
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
        isGroup: false,
      });

      // conversation မရှိရင် အသစ်ဖန်တီးမယ်
      if (!conversation) {
        conversation = await Conversation.create({
          isGroup: false,
          participants: [senderId, recipientId],
          // lastMessage ကို ဖန်တီးထားသင့်တာ မဟုတ်ပါ
          // ပထမ message ပို့တဲ့အချိန်မှာ lastMessage ကို update လုပ်မယ်
        });
      }
    }

    // image upload လုပ်မယ်ဆိုရင် cloudinary upload
    if (img) {
      const uploaded = await cloudinary.uploader.upload(img);
      img = uploaded.secure_url;
    }

    // message အသစ်ဖန်တီး
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
      seenBy: [senderId], // sender မှာ message ကို ရှေ့တန်းမှာကြည့်ပြီးသားအဖြစ် မှတ်မယ်
    });

    // conversation.lastMessage update လုပ်မယ် (seenBy ကနေ ဘယ်သူတွေကြည့်ပြီးဆိုတာ ကိုင်တွယ်ချင်ရင်)
    conversation.lastMessage = {
      text: message,
      sender: senderId,
      seenBy: [senderId],  // ပို့သူက message ကိုကြည့်ပြီးသားဖြစ်တာ
    };

    await conversation.save();

    // socket.io ကို notification ပို့မယ် (sender မဟုတ်တဲ့ participant တွေကို)
    conversation.participants.forEach((pid) => {
      if (pid.toString() !== senderId.toString()) {
        const socketId = getRecipientSocketId(pid.toString());
        if (socketId) {
          io.to(socketId).emit("newMessage", newMessage);
        }
      }
    });

    return newMessage;
  } catch (err) {
    console.error("Send Message Error:", err);
    return null;
  }
};


const getMessages = async ({ conversationId }) => {
  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });
  return messages;
};

const getConversations = async (userId) => {
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    conversations.forEach((conv) => {
      if (!conv.isGroup) {
        conv.participants = conv.participants.filter(
          (p) => p._id.toString() !== userId.toString()
        );
      }
    });

    return conversations;
  } catch (err) {
    return err.message;
  }
};

const renameGroup = async ({ conversationId, name }) => {
  try {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { name },
      { new: true }
    );
    return updated;
  } catch (error) {
    console.error("Rename Group Error:", error);
    return null;
  }
};

const addToGroup = async ({ conversationId, userId }) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) return null;

    if (!conversation.participants.includes(userId)) {
      conversation.participants.push(userId);
      await conversation.save();
    }
    return conversation;
  } catch (error) {
    console.error("Add to Group Error:", error);
    return null;
  }
};

const removeFromGroup = async ({ conversationId, userId }) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) return null;

    conversation.participants = conversation.participants.filter(
      (id) => id.toString() !== userId
    );
    await conversation.save();

    return conversation;
  } catch (error) {
    console.error("Remove from Group Error:", error);
    return null;
  }
};

module.exports = {
  sendMessage,
  findConversation,
  getMessages,
  getConversations,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
