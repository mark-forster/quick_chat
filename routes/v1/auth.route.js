const express= require('express');
const router=express.Router();
const authController = require('../../controllers/auth.controller')
const isAuth= require('../../middlewares/isAuth');
router.post('/signUp', authController.signUp);
router.post('/signIn', authController.signIn);
router.post('/signOut',isAuth, authController.signOut);
module.exports =router;