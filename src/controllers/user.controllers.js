import { User } from "../models/user.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const generateAccessAndRefreshToken=async(userId)=>{
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
}

const registerUser=asyncHandler(async (req,res,next)=>{
    const {username,email,phno,fullName,password}=req.body

    if(!username){
        return next(apiError.badRequest(400,"username is required"))
    }
    else if(!email){
        return next(apiError.badRequest(400,"email is required"))
    }
    else if(!phno){
        return next(apiError.badRequest(400,"phone number is required"))
    }
    else if(!password){
        return next(apiError.badRequest(400,"password is required"))
    }

    const existedUser=await User.findOne({username})

    if(existedUser){
        return next(apiError.badRequest(400,"user is already exists"))
    }

    const profileLocalPath=req.file?.path;

    //console.log(req.files)
    if(!profileLocalPath){
        return next(apiError.badRequest(400,"profile is required"))
    }

    const profile=await uploadOnCloudinary(profileLocalPath)

    const user=await User.create({
        username:username.toLowerCase(),
        email,
        fullName,
        phno,
        password,
        profile:profile.url
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        return next(apiError.badRequest(400,"something went wrong while registering"))
    }

    return res.status(200)
    .json(new apiResponse(200,createdUser,"register success..."))

})

const loginUser=asyncHandler(async(req,res,next)=>{
    const {username,password}=req.body

    if(!username){
        return next(apiError.badRequest(400,"username is required"))
    }

    const user=await User.findOne({username})

    if(!user){
        return next(apiError.notFound(404,"username not found"))
    }

    const isPasswordValid=await user.isCorrectPassword(password)

    if(!isPasswordValid){
        return next(apiError.unAuthorized(401,"wrong password.!!"))
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "login success..."
        )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                accessToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"logout success..."))
})


export {registerUser,
        loginUser,
        logoutUser
}