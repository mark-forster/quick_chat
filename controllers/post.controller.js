const Post= require('../models/post.model')
const User= require('../models/user.model')
const catchAsync= require('../config/catchAsync')
const ApiError= require('../config/apiError')
const postService = require('../services/post.service')
const httpStatus = require('http-status')
const cloudinary = require('cloudinary').v2;
// getting all posts
const getAllPost= catchAsync(async(req,res,next) => {
    const posts= await Post.find({}).exec();
    res.status(httpStatus.OK).json({posts: posts})
})

// creating a new post
const createPost = catchAsync (async(req,res)=>{
   try{
    const data= req.body;
    const user_id = req.user._id;

    const post = await postService.newPost(user_id,data);
 return  res.status(httpStatus.OK).json({post: post, message:"Post created successfully"})
   }
   catch(error){
    return res.json({errorMessage: error.message})
   }
})
// get post by Id
const getpostById= catchAsync (async(req,res,next) =>{
    const postId= req.params.postId;
    const post = await postService.getPostById(postId);
    if(!post){
        throw new ApiError(httpStatus.NOT_FOUND,"Post not found")
    }
    res.status(200).json({post:post})
});
// delete post by Id
const deletePostById= catchAsync (async(req,res,next) =>{
    const postId= req.params.postId;
    const user_id = req.user._id;
    try{
        const toDeletePost= await Post.findById(postId);
    if(!toDeletePost){
        throw new ApiError(httpStatus.NOT_FOUND,"Post not found")
    }
    
		if (toDeletePost.postedBy == req.user._id) {
			throw new ApiError(httpStatus.BAD_GATEWAY,"An unthrozied user to delete post");
		}

		if (toDeletePost.img) {
			const imgId = toDeletePost.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}


    await Post.findByIdAndDelete(postId);
    return res.status(200).json({message:"Post deleted successfully"});
    }
    catch(error){
        return res.json({errorMessage: error.message})
    }
});
// delete all posts
const deleteAllPost= catchAsync(async(req,res,next)=>{
    await Post.deleteMany({});
    return res.status(200).json({message:"All posts deleted successfully"});
})

// Toggle like Unlike
const likePostById= catchAsync (async(req,res,next)=>{
    const postId = req.params.postId;
    const userId = req.user._id;
    const result = await postService.toggleLikeUnlike(userId, postId);
    return res.status(200).json({message:result.message});
});
// reply Post
const replyToPost= catchAsync(async(req,res,next)=>{
    const postId = req.params.postId;
    const userId = req.user._id;
    const text = req.body.text;
    if(!text){
        throw new ApiError(httpStatus.BAD_REQUEST,"Comment cannot be blank");
    }
    const result= await postService.replyToPost(postId,userId,text);
    return res.status(200).json({message:result.message, reply: result.reply});
})
// feed
const getFeed= async(req, res)=>{
    try{
        const userId = req.user._id;
        if(!userId){
            throw new ApiError(httpStatus.UNAUTHORIZED, "User not logged in"); // exit the function if user is not logged in. Otherwise, it will throw an error and continue executing the next middleware.  // In Express, the next() function is used to pass control to the next middleware in the stack. If there's no more middleware, it will call the route handler function.
        }
    const result = await postService.getFeed(userId);
    return res.status(200).json({posts:result});
    }
    catch(error){
       return res.status(500).json({errmessage:error.message});
    }
}
// user Posts
const getUserPost= async(req, res, next)=>{
    const username= req.params.username;
    const user= await User.findOne({username});
    if(!user){
       return res.json({errmessage:"User not found"});
    }
   const posts= await Post.find({postedBy:user._id});
   if(!posts){
    return res.json({errmessage:"Post not found"});
   }
   return res.status(200).json({posts:posts})
    // console.log(posts);
};

module.exports= {
    createPost,
    getAllPost,
    getpostById,
    deletePostById,
    deleteAllPost,
    likePostById,
    replyToPost,
    getFeed,
    getUserPost
}
