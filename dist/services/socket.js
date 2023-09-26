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
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
const chat_1 = __importDefault(require("../models/chat"));
dotenv_1.default.config();
const tracker = {};
exports.default = (server) => {
    try {
        const io = new socket_io_1.Server(server, { cors: {
                origin: process.env.CLIENT_URL
            } });
        const ns = io.of("/");
        const postsID = "0000.00.000.0000";
        io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const token = socket.handshake.auth.token;
                const err = new Error("UNAUTHENTICATED");
                if (!token)
                    return next(err);
                const payload = jsonwebtoken_1.default.verify(token, process.env.APP_SECRET);
                const user = yield user_1.default.findById(payload.id);
                if (!user)
                    return next(err);
                user.socketId = socket.id;
                user.online = true;
                yield user.save();
                tracker[socket.id] = user;
                next();
            }
            catch (ex) {
                console.log(ex, ".......");
                console.log(socket.id);
                io.to(socket.id).emit("logout");
            }
        }));
        ns.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
            socket.join(postsID);
            const user = yield user_1.default.findOne({ socketId: socket.id });
            if (!user)
                return emitError();
            user.chats.map(chat => socket.join(String(chat)));
            socket.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    let user = yield getUser(socket.id).populate("chats");
                    let targetChat = (user === null || user === void 0 ? void 0 : user.chats).find(c => String(c._id) === String(data.chatId));
                    if (!targetChat) {
                        const updatedUser = yield user_1.default.findById(user._id).populate("chats");
                        if (updatedUser) {
                            tracker[String(socket.id)] = updatedUser;
                        }
                        targetChat = (user === null || user === void 0 ? void 0 : user.chats).find(c => String(c._id) === String(data.chatId));
                    }
                    console.log(targetChat);
                    if (!targetChat)
                        return emitError(new Error("chat not found"));
                    console.log("client emmitted");
                    const message = Object.assign(Object.assign({}, data), { sentBy: user.email });
                    console.log("message recieved by server", data);
                    targetChat.set("messages", [...targetChat.messages, message]);
                    yield targetChat.save();
                    if (!socket.rooms.has(String(data.chatId))) {
                        socket.join(String(data.chatId));
                    }
                    ns.to(String(data.chatId)).emit("message", message);
                    console.log("message emitted to members");
                }
                catch (ex) {
                    console.log(ex);
                }
            }));
            socket.on("read", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const user = getUser(socket.id);
                const targetChat = user.chats.find(c => String(c) === String(data.chatId));
                if (!targetChat)
                    return emitError(new Error("chat not found"));
                const chat = yield chat_1.default.findById(targetChat);
                chat === null || chat === void 0 ? void 0 : chat.messages.forEach(message => {
                    if (!message.timestamp.readAt) {
                        message.timestamp.readAt = Date.now();
                    }
                });
                yield (chat === null || chat === void 0 ? void 0 : chat.save());
                socket.to(String(data.chatId)).emit("read", { chatId: data.chatId });
            }));
            socket.on("post", (data) => {
                const user = getUser(String(socket.id));
                const postObj = Object.assign(Object.assign({}, data), { postedBy: user._id });
                ns.to(postsID).emit("post");
            });
            socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
                delete tracker[socket.id];
                const user = getUser(socket.id);
                if (user) {
                    user.socketId = undefined;
                    user.online = false;
                    yield user.save();
                }
            }));
            function getUser(socketId) {
                return tracker[socketId];
            }
            function emitError(err) {
                if (err) {
                    socket.emit("client_error", err);
                }
                else {
                    const err = new Error("UNAUTHENTICATED (user not found)");
                    socket.emit("client_error", err);
                }
            }
        }));
    }
    catch (ex) {
        console.log("socket error", ex);
    }
};
