const User = require('../models/user.model')
const jwt= require('jsonwebtoken')
const ApiError = require('../config/apiError')
const catchAsync= require('../config/catchAsync')


 const isAuth = catchAsync(async(req, _, next) => {
    try {
        const token = req.cookies?.token;
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

module.exports= isAuth;