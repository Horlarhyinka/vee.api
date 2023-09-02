import mongoose from "mongoose";
import {chat_int} from "./types/chat.types";
import messageSchema from "./message";

const chatSchema = new mongoose.Schema<chat_int>({
    friend: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    messages: { type: [messageSchema], default: [] },
}, { timestamps: true})

export default mongoose.model("chat", chatSchema);