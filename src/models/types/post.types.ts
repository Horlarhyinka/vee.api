import { Document, ObjectId } from "mongoose";
import { message_int } from "./message.types";
import { user_ref_type } from "./user.types";

export interface post_int extends message_int{
    postedBy: user_ref_type
    replyTo?: string | ObjectId
}

export type post_ref_type = string | post_int | ObjectId