import catchAsyncErrors from "../utils/catchAsyncErrors";
import {Request, Response} from "express";
import Post from "../models/post";
import { user_int } from "../models/types/user.types";

interface ExtReq extends Request{
    user: user_int
}

export const getPosts = catchAsyncErrors(async(req: Request, res: Response)=>{
    const posts = await Post.find({})
    return res.status(200).json({message: "success", data: posts})
})

export const getPost = catchAsyncErrors(async(req: Request, res: Response)=>{
    const postId = req.params.postId
    const post = await Post.findById(postId)
    if(!post)return res.status(404).json({message: "post not found"})
    const replies = await Post.find({replyTo: post._id})
    return res.status(200).json({message: "success", data: {...post, replies}})
})

export const deletePost = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const postId = req.params.postId
    const user = req.user;
    const indx = user.posts.findIndex(p=>String(p)=== postId)
    if(!indx)return res.status(404).json({message: "post not found"})
    await Post.findByIdAndDelete(postId)
    return res.status(200).json({message: "successful"})
})