import catchAsyncErrors from "../utils/catchAsyncErrors";
import {Request, Response } from "express";
import Chat from "../models/chat";
import User from "../models/user"
import { user_int } from "../models/types/user.types";
import catchMongooseErr from "../utils/handleMongooseErr";
import { chat_int, public_chat_int } from "../models/types/chat.types";

interface ExtReq extends Request{
    user: user_int
}

export const addChat = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const friendId = req.body.friendId || req.body.friend 
    const friend = await User.findById(friendId)
    if(!friend)return res.status(404).json({message: "user not found", status: "failed"})
    const user = await req.user!.populate("chats");
    const exists = (user.chats as chat_int[]).findIndex(c => String(selectFriend(user,c)?._id) === friendId)
    if(exists >= 0 )return res.status(429).json({message: "duplicate resource"})
    try {
    const chat = await (await Chat.create({friends: [friend._id, user._id]})).populate(["friends", "messages"])
    user.chats.push(chat._id)
    friend.chats.push(chat._id)
    await user.save();
    await friend.save();
    chat.friends.forEach(f=>{
        f.password = ""
    })
    const data = {...chat.toObject(), friend: selectFriend(user, chat)!} as public_chat_int
    return res.status(200).json({message: "successful", data })
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
        const user = await req.user.populate({
            path: "chats",
            populate:{
                path: "friends"
            }
        });
        const target = (user.chats as chat_int[]).find(c=>String(c._id) === String(chatId))
        if(!target)return res.status(404).json({message: "chat not found"})
        await Promise.all(target.friends.map(async(friend)=>{
            await friend.updateOne({$pull:{ chats: target._id } })
        }))
        await target.deleteOne()
        return res.status(200).json({message: "successful"})
    } catch (ex) {
        return res.status(500).json({message: "failed"})
    }
})

export const getChats = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const user = await req.user.populate(["chats"]);
    const populated = await Promise.all((user.chats as chat_int[]).map(async(chat)=>{
        const result = await chat.populate("friends")        
        result.friends.forEach(f=>{//2 iterations
            f.password = ""
        })
        const publicChat = {...result.toObject(), friend: selectFriend(user, result)} as public_chat_int

        return publicChat
    }))
    return res.status(200).json({message: "successful", data: populated})
})

export const getChat = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const chatId = req.params.chatId
    if(!chatId)return res.status(400).json({message: "chatId is required"})
    const user = await req.user.populate("chats");
    const indx = (user.chats as chat_int[]).findIndex(chat=>String(chat._id) === String(chatId))
    if(indx < 0)return res.status(404).json({message: "chat not found"})
    const target: chat_int = await (user.chats[indx]! as chat_int).populate("friends") 
    target.friends.forEach(f=>{
        f.password = ""
    })
    const data = {...target.toObject(), friend: selectFriend(user, target)}
    return res.status(200).json({message: "successful", data })
})

function selectFriend(user: user_int, chat: chat_int){
    return chat.friends.find(c=>String(c._id) !== String(user._id))
}