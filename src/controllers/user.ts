import { Request, Response } from "express";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import User from "../models/user";
import { user_int } from "../models/types/user.types";

interface ExtReq extends Request{
    user: user_int
}

export const getUsers = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const user = req.user
    const users = await User.find({}).select(["-password"])
    const not_friends = users.filter(u=>{
        const currUserChatSet = new Set(user.chats)
        const currentIterationSet = new Set(u.chats.map(c=>String(c)))
        let passed = true
        if(String(u._id)===String(user._id))return false;
        for(let chat of currUserChatSet){
            if(currentIterationSet.has(String(chat))){
                passed = false
                return;
            }
        }
        return passed;
    })
    return res.status(200).json({message: "successful", data: not_friends})
})

export const updateProfile = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const user = req.user;
    const muttables = ["username", "about", "avatar"]
    for(let i = 0; i < muttables.length; i++){
        const key = muttables[i] as (keyof typeof user)
        if(req.body[key]){
            user.set(key, req.body[key])
        }
    }
    const updatedUser = await user.save()
    updatedUser.password = ""
    return res.status(200).json({message: "successful", data: updatedUser})
})

export  const getProfile = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const user = req.user;
    user.password = ""
    return res.status(200).json({message: "successful", data: user})
})

export const getUser = catchAsyncErrors(async(req: Request, res: Response)=>{
    const userId = req.params.userId || req.query.userId
    if(!userId) return res.status(400).json({message: "userId is required"})
    const user = await User.findById(String(userId))
    if(!user)return res.status(404).json({message: "user not found"})
    user.password = ""
    return res.status(200).json({message: "successful", data: user})
})

