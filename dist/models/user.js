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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: [true, "username is required"], minlength: 3 },
    email: { type: String, required: [true, "email is required"], unique: true, match: /^([a-z0-9\.@\-]{3,})@([a-z@\.])+\.([a-z0-9]{2,})$/i },
    password: { type: String, required: [true, "password is required"], minlength: 6 },
    chats: { type: [mongoose_1.default.Schema.Types.ObjectId], ref: "chat", default: [] },
    posts: { type: [mongoose_1.default.Schema.Types.ObjectId], ref: "post" },
    token: { type: String },
    tokenExpiresIn: { type: Date },
    online: { type: Boolean, default: false },
    socketId: { type: String, }
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt();
        const hashed = yield bcrypt_1.default.hash(this.password, salt);
        this.password = hashed;
        next();
    });
});
userSchema.methods.generateToken = function () {
    const payload = { id: this._id };
    return jsonwebtoken_1.default.sign(payload, String(process.env.APP_SECRET));
};
userSchema.methods.comparePassword = function (password) {
    return bcrypt_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model("user", userSchema);
