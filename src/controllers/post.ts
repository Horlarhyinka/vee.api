import catchAsyncErrors from "../utils/catchAsyncErrors";
import {Request, Response} from "express";
import Post from "../models/post";
import { user_int } from "../models/types/user.types";
import { post_int } from "../models/types/post.types";

interface ExtReq extends Request{
    user: user_int
}

export const getPosts = catchAsyncErrors(async(req: Request, res: Response)=>{
    const query = req.query.q || req.body.q
    const userId = req.query.userId || req.body.userId
    let result;
    if(userId){
        result = await Post.find({postedBy: String(userId)}).populate("postedBy").sort("-createdAt")
    }
    if(query){
        const reg = new RegExp(`[${query}]`)
        if(result){
            result = result.filter(po=>reg.test(String(po.body)) || reg.test((po.postedBy as user_int).username))
        }else{
            result = await Post.find({replyTo: undefined}).populate("postedBy").where("body").regex(reg).sort("-createdAt")
        }
    }
    if(!userId && !query){
        result = await Post.find({replyTo: undefined}).populate("postedBy").sort("-createdAt")
    }
    return res.status(200).json({message: "success", data: result})
})

export const getPost = catchAsyncErrors(async(req: Request, res: Response)=>{
    const postId = req.params.postId
    const post = await Post.findById(String(postId)).populate("postedBy")
    if(!post)return res.status(404).json({message: "post not found"})
    const replies = await Post.find({replyTo: post._id}).populate("postedBy")
    return res.status(200).json({message: "success", data: {...post.toObject(), replies}})
})

export const deletePost = catchAsyncErrors(async(req: ExtReq, res: Response)=>{
    const postId = req.params.postId
    const user = req.user;
    const indx = user.posts.findIndex(p=>String(p)=== postId)
    if(!indx)return res.status(404).json({message: "post not found"})
    await Post.findByIdAndDelete(postId)
    return res.status(200).json({message: "successful"})
})