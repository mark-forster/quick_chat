const Post= require('../models/post.model')
const User= require('../models/user.model')
const ApiError = require('../config/apiError')
const httpStatus = require('http-status')
const cloudinary = require('cloudinary').v2;

const newPost = async(user_id,data)=>{
    const {text} = data;
    let {img} = data;
    if(!text) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Text  are required', true);
    }
    const postedBy = user_id;
    // title length 
    const maxLength = 500;
    if(text.length > maxLength){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Title should not exceed 500 characters', true);
    }
    // uploading imgae in cloudinary
   if(img){
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img= uploadedResponse.secure_url;
   }
    const post = await new Post({postedBy,text, img})
    await post.save();
    return post;
}
const getPostById= async(postId)=>{
    const post = await Post.findById(postId);
    return post;
}
// Toggle Like Unlike 
const toggleLikeUnlike= async(userId,postId)=>{
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(httpStatus.NOT_FOUND, 'Post not found', true);
    }
    const userLikePost = await post.likes.includes(userId);
    if(userLikePost){
        await Post.findByIdAndUpdate(postId,{$pull: {likes : userId}}) //  Unlike
        return ({post:post,message:"User unlike this post"})
    }
    else{
        await Post.findByIdAndUpdate(postId,{$push: {likes : userId}}) // Like
        return ({post:post,message:"User like this post"})
    }
}

// replying to post
const replyToPost= async(postId,userId,text)=>{
        const user= await User.findById(userId);
        const username= user.username;
        const profilePic= user.profilePic;
        const post = await Post.findById(postId);
        if(!post){
            throw new ApiError(httpStatus.NOT_FOUND, 'Post not found', true);
        }
        const reply = {userId,text,profilePic,username}
         post.replies.push(reply)
        await post.save();
        return ({reply:reply,message:"Reply posted successfully"})
}
// getting feed
const getFeed = async(userId)=>{
    const user = await User.findById(userId);//admin
    const following =await user.following;//admin's following people
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 }); //admin follwing people's post
  
    return feedPosts;

}
module.exports = {
    newPost,
    getPostById,
    toggleLikeUnlike,
    replyToPost,
    getFeed
}