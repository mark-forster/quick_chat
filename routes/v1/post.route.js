const express= require('express');
const router=express.Router();
const postController = require('../../controllers/post.controller')
const isAuth= require('../../middlewares/isAuth');

// Get all posts
// router.get('/feeds', isAuth, postController.getFeed)
router.get('/feedPosts', isAuth, postController.getFeed);

router.get('/', isAuth, postController.getAllPost);
router.post('/create', isAuth, postController.createPost);
router.get('/:postId', isAuth, postController.getpostById);
router.get('/user/:username', isAuth, postController.getUserPost);
router.delete('/:postId', isAuth, postController.deletePostById);
router.delete('/', isAuth, postController.deleteAllPost)
// like unlike post
router.put('/like/:postId', isAuth, postController.likePostById);
router.put("/reply/:postId", isAuth, postController.replyToPost);
module.exports =router;