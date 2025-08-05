const User = require('../models/user.model')
const ApiError = require('../config/apiError')
const httpStatus = require('http-status')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid'); // import uuid

const followUnfollow = async(currentUser_id,follower_id )=>{
    if(currentUser_id == follower_id){
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot follow yourself')
    }
    const userToFollow = await User.findById(follower_id)
    // current user 
    const currentUser= await User.findById(currentUser_id);
    if(!currentUser || !userToFollow){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }
    // checking current user already followings this user
    const isfollowing = await currentUser.following.includes(follower_id);

    if(isfollowing){
        // unfollow this User
        // Modify current user's following, userToFollow's follower
        await User.findByIdAndUpdate(currentUser_id,{$pull: {following : follower_id}}) // update following
        await User.findByIdAndUpdate(follower_id,{$pull: {followers : currentUser_id}}) // update followers
        return {message:"User unfollowed successfully"}
    }
    else{
        // follow this user
        // Modify current user's following, userToFollow's follower
        await User.findByIdAndUpdate(currentUser_id,{$push: {following : follower_id}}) // update following
        await User.findByIdAndUpdate(follower_id,{$push: {followers : currentUser_id}}) // update followers
        return {message:"User Followed successfully"}
    }
    
};
// updating User
const updateUser= async(userId,data)=>{
    // getting profile picture
    const user = await User.findById(userId);
    console.log(data.profilePic);
    if (data.profilePic) {
    if (user.profilePic) {
        await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
    }

    const uuid = uuidv4(); // generate a UUID
    const uploadedResponse = await cloudinary.uploader.upload(data.profilePic, {
        public_id: uuid,           // custom filename using UUID
        use_filename: false,       // don’t use the original filename
        unique_filename: false,    // don’t generate extra UUID
        overwrite: true            // if same name exists, overwrite it
    });

    data.profilePic = uploadedResponse.secure_url;
}
    user.name = data.name || user.name;
    user.email = data.email || user.email;
    user.username = data.username || user.username;
    user.profilePic =data.profilePic || user.profilePic;
    user.bio = data.bio || user.bio;
    user.password= data.password || user.password;
    //     await user.save();
        // Object.assign(user, data);
  await user.save();
        return user;
}
// getting suggested users
const getSuggestedUsers= async(userId)=>{
    const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));
        return suggestedUsers;
}
module.exports = { followUnfollow,updateUser,getSuggestedUsers}