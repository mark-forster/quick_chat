const Message = require('../models/message.model')
const Conversation= require('../models/conversation.model');
const { getRecipientSocketId, io } = require('../socket/socket');
const cloudinary = require('cloudinary').v2;
const sendMessage = async ({recipientId, message,senderId,img})=>{
    try{
       
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        });
        // creating new conversation
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId], //senderId and reciverId
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            });
            await conversation.save();
        }

        if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

        // creating new Message
        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
             img: img || "",
        });
        // 
        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            }),
        ]);

        const recipientSocketId= getRecipientSocketId(recipientId);
        if(recipientSocketId){
        io.to(recipientSocketId).emit("newMessage", newMessage);
        }
        return newMessage;
    }
    catch(err){
        return null;
    }
}


const getMessages= async ({otherUserId,userId}) => {
    const conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
        conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return messages;
}

const getConversations= async (userId)=>{
    try{
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic",
        });
        // remove the current user from the participants array
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            );
        });
        return (conversations);
    }
    catch(err){
        return (err.message)
    }
}
module.exports= {sendMessage,getMessages,getConversations}