const User = require('../models/user.model')
const ApiError = require('../config/apiError')
const httpStatus = require('http-status')
const register = async (data)=>{
        const {name, username, email,password} = data;
         // validate input values
         if(!name || !username || !email || !password){
            throw new ApiError(httpStatus.BAD_REQUEST,"Email and password are required")
        }
         const user= await User.create(data);
         const accessToken= await user.generateAccessToken();
         const options = {
            httpOnly: true,
            secure: true
        }
         return {user, accessToken,options}
}

const login= async (data)=>{
        const {email, password} = data;
        // validate input values
        if(!email || !password){
            throw new ApiError(httpStatus.BAD_REQUEST,"Email and password are required")
        }

        const user= await User.findOne({email: email});
        if(!user){
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Username or Password");
          }
        const isPasswordValid = await user.isPasswordMatch(password, user.password)
        if(!isPasswordValid){
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Username or Password");
          }
          const accessToken= await user.generateAccessToken();
          const loginUser= await User.findById(user._id).select("-password ");
          const options = {
            httpOnly: true,
            secure: true
        }
        return {user:loginUser, accessToken:accessToken, options:options}
}

const logout= async(user_id)=>{
    const user=   await User.findByIdAndUpdate(
          user_id,
          {
              $unset: {
                  refreshToken: 1 // this removes the field from document
              }
          },
          {
              new: true
          }
      )
      const options = {
          httpOnly: true,
          secure: true
      }
      return {user, options};
  }

module.exports = {
    register,login,logout
}