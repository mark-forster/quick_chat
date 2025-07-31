const express= require('express');
const connectDB = require('./db/connectDb');
require("dotenv").config();
const cookieParser = require('cookie-parser');
const routes = require('./routes/v1/index.route')
const httpStatus = require("http-status");
const {app,server} = require('./socket/socket');
const { errorHandler,errorConverter } = require("./middlewares/error");
const path= require('path');
// const __dirname = path.resolve();

// Require the cloudinary library
const cloudinary = require('cloudinary').v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});
const ApiError= require('./config/apiError');
connectDB();
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.json());//To parse json data in req.body
app.use(express.urlencoded({ extended:false })); //To parse data in req.body
app.use(cookieParser());


// routes conncection
app.use('/api/v1/', routes)

// frontend backend=>localhost:8080
// if(process.env.NODE_ENV === 'production'){
 
//  app.use(express.static(path.join(__dirname,"../frontend/dist")));
//   // react app
//  app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
//   });
// }
server.listen(process.env.PORT,()=>{
    console.log('Server is running on port 8080');
});  

// giving 404 Error for unknown request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "404 not found"));
  });
//   handle any error to show error message
  app.use(errorConverter);
  app.use(errorHandler);