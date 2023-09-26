import { Document, ObjectId } from "mongoose";
import { user_int } from "./user.types";
import { message_int } from "./message.types";


export interface chat_int extends Document{
    friends: [user_int]
    messages: message_int[]
}

export interface public_chat_int extends chat_int{
    friend: user_int
}

export type chat_ref_type = chat_int | string | ObjectId