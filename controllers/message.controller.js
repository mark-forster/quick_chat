const Message = require('../models/message.model')
const catchAsync = require('../config/catchAsync');
const ApiError = require('../config/apiError');
const Conversation= require('../models/conversation.model')
const cloudinary = require('cloudinary').v2;
const messageService = require('../services/message.service')
const sendMessage= catchAsync(
    async(req,res,next)=>{
                    const {recipientId, message} = req.body;
                    let {img}= req.body;
                    const senderId= req.user._id;
                    const newMessage = await messageService.sendMessage({recipientId,message,senderId,img});
                    res.status(201).json({message: 'Message sent successfully', message: newMessage});
    }
)

const getMessages= catchAsync(
    async(req,res,next)=>{
        const { otherUserId } = req.params;
	const userId = req.user._id;
        const result = await messageService.getMessages({otherUserId,userId});
        res.send(result)
    });
const getConversations= catchAsync(async(req,res,next)=>{
    const userId= req.user._id;
    const result= await messageService.getConversations(userId);
    res.status(200).json({message: 'Message sent successfully', conversations: result});
});
module.exports = {
    sendMessage,
    getMessages,
    getConversations
}