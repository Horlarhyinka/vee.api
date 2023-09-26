import mongoose from "mongoose";
import { post_int } from "./types/post.types";
import { fileSchema } from "./message";

const postSchema = new mongoose.Schema<post_int>({
    body: { type: String },
    file: { type: fileSchema},
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    replyTo: { type: String },
    comments: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
        default: []
    }
},{ timestamps: true})

export default mongoose.model("post", postSchema)