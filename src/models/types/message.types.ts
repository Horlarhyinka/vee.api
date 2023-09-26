import { Document, ObjectId } from "mongoose";

export interface message_int extends Document{
    timestamp: timestamp_type
    body?: string
    file?: file_int
    sentBy: string
}

export interface file_int extends Document{
    name: string
    thumbnail: string
    size: string
    format: string
    url: string
}

export type timestamp_type = {
    sentAt: Date | number
    readAt: Date | number | null
}

export type message_ref_type = message_int | ObjectId | string