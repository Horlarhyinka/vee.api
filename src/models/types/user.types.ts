import { Document, ObjectId } from "mongoose";
import { chat_ref_type } from "./chat.types";
import { post_ref_type } from "./post.types";

export interface user_int extends Document{
    email: string
    username: string
    password: string
    chats: chat_ref_type[]
    posts: post_ref_type[]
    generateToken: ()=>string
    comparePassword: (password: string)=>Promise<boolean>
    token?: string,
    tokenExpiresIn?: Date
    online: boolean
    socketId?: string
    about?: string
    avatar: string
}

export type user_ref_type = user_int | ObjectId | string