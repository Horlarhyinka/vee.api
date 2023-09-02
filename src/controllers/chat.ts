import catchAsyncErrors from "../utils/catchAsyncErrors";
import {Request, Response } from "express";
import Chat from "../models/chat";
import User from "../models/user"
import { user_int } from "../models/types/user.types";
import catchMongooseErr from "../utils/handleMongooseErr";
import { chat_int } from "../models/types/chat.types";
import chat from "../models/chat";

interface ExtReq extends Request{
    user: user_int
}

export const addChat = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const friendId = req.body.friendId || req.body.friend 
    const friend = await User.findById(friendId)
    if(!friend)return res.status(404).json({message: "user not found", status: "failed"})
    const user = await req.user!.populate("chats");
    const exists = (user.chats as chat_int[]).findIndex(c => String(c.friend) === friendId)
    if(exists >= 0 )return res.status(429).json({message: "duplicate resource"})
    try {
    const chat = await (await Chat.create({friend: friend._id})).populate(["friend", "messages"])
    user.chats.push(chat._id)
    friend.chats.push(chat._id)
    await user.save();
    await friend.save();
    chat.friend.password = ""
    return res.status(200).json({message: "successful", data: chat})
    } catch (ex: any) {
        console.log(ex)
        const message = catchMongooseErr(ex)
        if(!message)return res.status(500).json({message: "failed"})
        res.status(401).json({message})
    }

})

export const deleteChat = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const chatId = req.params.chatId
    if(!chatId)return res.status(400).json({message: "chatId is required"})
    try {
        const user = req.user;
        user.chats = user.chats.filter(c=>String(c) !== chatId)
        await user.save();
        return res.status(200).json({message: "successful"})
    } catch (ex) {
        return res.status(500).json({message: "failed"})
    }
})

export const getChats = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const user = await req.user.populate(["chats"]);
    const populated = await Promise.all((user.chats as chat_int[]).map(async(chat)=>{
        return await chat.populate("friend")
    }))
    return res.status(200).json({message: "successful", data: populated})
})

export const getChat = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const chatId = req.params.chatId
    if(!chatId)return res.status(400).json({message: "chatId is required"})
    const user = await req.user.populate("chats");
    const indx = (user.chats as chat_int[]).findIndex(chat=>String(chat._id) === String(chatId))
    if(indx < 0)return res.status(404).json({message: "chat not found"})
    const target: chat_int = await (user.chats[indx]! as chat_int).populate("friend") 
    target.friend.password = ""
    return res.status(200).json({message: "successful", data: target})
})