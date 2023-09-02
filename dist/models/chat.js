"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = __importDefault(require("./message"));
const chatSchema = new mongoose_1.default.Schema({
    friend: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "user", required: true },
    messages: { type: [message_1.default], default: [] },
}, { timestamps: true });
exports.default = mongoose_1.default.model("chat", chatSchema);
