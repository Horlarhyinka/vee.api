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
exports.resetPassword = exports.forgetPassword = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const handleMongooseErr_1 = __importDefault(require("../utils/handleMongooseErr"));
const crypto_1 = __importDefault(require("crypto"));
const mailer_1 = require("../services/mailer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.register = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield user_1.default.create(Object.assign({}, req.body));
        const token = newUser.generateToken();
        newUser.password = "";
        return res.status(201).json({ message: "successful", data: { user: newUser, token } });
    }
    catch (ex) {
        const message = (0, handleMongooseErr_1.default)(ex);
        if (!message)
            return res.status(500).json({ message: "failed to register" });
        res.status(401).json({ message });
    }
}));
exports.login = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(401).json({ message: "email and password is required" });
    const user = yield user_1.default.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "user not found" });
    const validatePwd = yield user.comparePassword(password);
    if (!validatePwd)
        return res.status(401).json({ message: "incorrect password" });
    const token = user.generateToken();
    user.password = "";
    return res.status(200).json({ message: "successful", data: { user, token } });
}));
exports.forgetPassword = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        return res.status(401).json({ message: "email is required" });
    const user = yield user_1.default.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "email not found" });
    const token = crypto_1.default.randomBytes(11).toString("hex");
    user.token = token;
    user.tokenExpiresIn = new Date(Date.now() + 2 * 1000 * 60 * 60);
    yield user.save();
    const url = `${process.env.CLIENT_URL}/forget-password/${token}`;
    const mailResponse = yield (0, mailer_1.sendPasswordResetToken)(user.email, url);
    if (!mailResponse)
        return res.status(501).json({ message: "email service down" });
    return res.status(204).json({ message: "succesful", data: "null" });
}));
exports.resetPassword = (0, catchAsyncErrors_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const user = yield user_1.default.findOne({ token, tokenExpiresIn: { $gte: new Date() } });
    if (!user)
        return res.status(401).json({ message: "invalid token" });
    const { newPassword } = req.body;
    if (!newPassword)
        return res.status(400).json({ message: "provide a new password" });
    user.password = newPassword;
    user.token = undefined;
    user.tokenExpiresIn = undefined;
    const updatedUser = yield user.save();
    const authToken = updatedUser.generateToken();
    user.password = "";
    return res.status(200).json({ message: "successful", data: { user, token: authToken } });
}));
