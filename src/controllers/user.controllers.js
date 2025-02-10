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

const registerUser=asyncHandler(async (req,res)=>{
    const {username,email,phno,fullName,password}=req.body

    if(!username){
        throw new apiError(401,"username is required")
    }
    else if(!email){
        throw new apiError(401,"email is required")
    }
    else if(!phno){
        throw new apiError(401,"phone number is required")
    }
    else if(!password){
        throw new apiError(401,"password is required")
    }

    const existedUser=await User.findOne({username})

    if(existedUser){
        throw new apiError(401,"this username is already exsist")
    }

    const profileLocalPath=req.file?.path;

    console.log(req.files)
    if(!profileLocalPath){
        throw new apiError(401,"profile is required")
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
        throw new apiError(401,"something went wrong while registering!!")
    }

    return res.status(200)
    .json(new apiResponse(200,createdUser,"register success..."))

})

const loginUser=asyncHandler(async(req,res)=>{
    const {username,password}=req.body

    if(!username){
        throw new apiError(401,"username is required...!")
    }

    const user=await User.findOne({username})

    if(!user){
        throw new apiError(401,"username is wrong!!")
    }

    const isPasswordValid=await user.isCorrectPassword(password)

    if(!isPasswordValid){
        throw new apiError(401,"password is invalid!!")
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