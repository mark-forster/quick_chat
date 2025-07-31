const express = require('express')
const router= express.Router()
const messageController = require('../../controllers/message.controller')
const isAuth= require('../../middlewares/isAuth');

router.post('/', isAuth, messageController.sendMessage)
router.get('/:otherUserId', isAuth, messageController.getMessages)
router.get('/msg/conversations', isAuth, messageController.getConversations)

module.exports = router;