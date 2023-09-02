import { file_int, message_int } from "./types/message.types";
import mongoose from "mongoose";

export const fileSchema = new mongoose.Schema<file_int>({
    name: {type: String, required: true},
    thumbnail: {type: String},
    format: { type: String },
    size: { type: String },
    url: {type: String}
})

const messageSchema = new mongoose.Schema<message_int>({
    body: { type: String },
    file: { type: fileSchema},
    timestamp: {
        sentAt: {type: Date, default: Date.now()},
        readAt: {type: Date, default: null}
    }
})

export default messageSchema;

