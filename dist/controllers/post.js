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
exports.deletePost = exports.getPost = exports.getPosts = void 0;
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const post_1 = __importDefault(require("../models/post"));
exports.getPosts = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_1.default.find({});
    return res.status(200).json({ message: "success", data: posts });
}));
exports.getPost = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const post = yield post_1.default.findById(postId);
    if (!post)
        return res.status(404).json({ message: "post not found" });
    const replies = yield post_1.default.find({ replyTo: post._id });
    return res.status(200).json({ message: "success", data: Object.assign(Object.assign({}, post), { replies }) });
}));
exports.deletePost = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const user = req.user;
    const indx = user.posts.findIndex(p => String(p) === postId);
    if (!indx)
        return res.status(404).json({ message: "post not found" });
    yield post_1.default.findByIdAndDelete(postId);
    return res.status(200).json({ message: "successful" });
}));
