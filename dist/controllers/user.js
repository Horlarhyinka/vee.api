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
exports.getUser = exports.getProfile = exports.updateProfile = exports.getUsers = void 0;
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const user_1 = __importDefault(require("../models/user"));
exports.getUsers = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const includeFriends = req.query.includeFriends || false;
    const users = yield user_1.default.find({}).select(["-password"]);
    if (!includeFriends) {
        const { chats } = yield req.user.populate("chats");
        chats.forEach(c => {
            const friendId = String(c.friend);
            const indx = users.findIndex(u => String(u === null || u === void 0 ? void 0 : u._id) === friendId);
            if (indx >= 0) {
                delete users[indx];
            }
        });
    }
    const indx = users.findIndex(u => { var _a; return String(u === null || u === void 0 ? void 0 : u._id) === String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id); });
    delete users[indx];
    return res.status(200).json({ message: "successful", data: [...users.filter(u => u)] });
}));
exports.updateProfile = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const muttables = ["username", "about", "avatar"];
    for (let i = 0; i < muttables.length; i++) {
        const key = muttables[i];
        if (req.body[key]) {
            user.set(key, req.body[key]);
        }
    }
    const updatedUser = yield user.save();
    updatedUser.password = "";
    return res.status(200).json({ message: "successful", data: updatedUser });
}));
exports.getProfile = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    user.password = "";
    return res.status(200).json({ message: "successful", data: user });
}));
exports.getUser = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId || req.query.userId;
    if (!userId)
        return res.status(400).json({ message: "userId is required" });
    const user = yield user_1.default.findById(String(userId));
    if (!user)
        return res.status(404).json({ message: "user not found" });
    user.password = "";
    return res.status(200).json({ message: "successful", data: user });
}));
