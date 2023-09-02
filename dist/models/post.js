"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = require("./message");
const postSchema = new mongoose_1.default.Schema({
    body: { type: String },
    file: { type: message_1.fileSchema },
    postedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "user", required: true },
    replyTo: { type: String }
}, { timestamps: true });
exports.default = mongoose_1.default.model("post", postSchema);
