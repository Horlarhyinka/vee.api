"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChat = exports.getChats = exports.deleteChat = exports.addChat = void 0;
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const chat_1 = __importDefault(require("../models/chat"));
const user_1 = __importDefault(require("../models/user"));
const handleMongooseErr_1 = __importDefault(require("../utils/handleMongooseErr"));
exports.addChat = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friendId = req.body.friendId || req.body.friend;
    const friend = yield user_1.default.findById(friendId);
    if (!friend)
        return res.status(404).json({ message: "user not found", status: "failed" });
    const user = yield req.user.populate("chats");
    const exists = user.chats.findIndex(c => String(c.friend) === friendId);
    if (exists >= 0)
        return res.status(429).json({ message: "duplicate resource" });
    try {
        const chat = yield (yield chat_1.default.create({ friend: friend._id })).populate(["friend", "messages"]);
        user.chats.push(chat._id);
        friend.chats.push(chat._id);
        yield user.save();
        yield friend.save();
        chat.friend.password = "";
        return res.status(200).json({ message: "successful", data: chat });
    }
    catch (ex) {
        console.log(ex);
        const message = (0, handleMongooseErr_1.default)(ex);
        if (!message)
            return res.status(500).json({ message: "failed" });
        res.status(401).json({ message });
    }
}));
exports.deleteChat = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    if (!chatId)
        return res.status(400).json({ message: "chatId is required" });
    try {
        const user = req.user;
        user.chats = user.chats.filter(c => String(c) !== chatId);
        yield user.save();
        return res.status(200).json({ message: "successful" });
    }
    catch (ex) {
        return res.status(500).json({ message: "failed" });
    }
}));
exports.getChats = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield req.user.populate(["chats"]);
    const populated = yield Promise.all(user.chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
        return yield chat.populate("friend");
    })));
    return res.status(200).json({ message: "successful", data: populated });
}));
exports.getChat = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    if (!chatId)
        return res.status(400).json({ message: "chatId is required" });
    const user = yield req.user.populate("chats");
    const indx = user.chats.findIndex(chat => String(chat._id) === String(chatId));
    if (indx < 0)
        return res.status(404).json({ message: "chat not found" });
    const target = yield user.chats[indx].populate("friend");
    target.friend.password = "";
    return res.status(200).json({ message: "successful", data: target });
}));
