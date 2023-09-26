"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.fileSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    thumbnail: { type: String },
    format: { type: String },
    size: { type: String },
    url: { type: String }
});
const messageSchema = new mongoose_1.default.Schema({
    body: { type: String },
    file: { type: exports.fileSchema },
    timestamp: {
        sentAt: { type: Date, default: Date.now() },
        readAt: { type: Date, default: null }
    },
    sentBy: { type: String }
});
exports.default = messageSchema;
