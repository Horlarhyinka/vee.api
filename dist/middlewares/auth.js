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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
dotenv_1.default.config();
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (token === null || token === void 0 ? void 0 : token.toLowerCase().startsWith("bearer")) {
        const splitted = token.split(" ");
        const key = splitted[1];
        if (!key)
            return res.status(401).json({ message: "UNAUTHENTICATED (provide a valid token)" });
        try {
            const decoded = jsonwebtoken_1.default.verify(key, process.env.APP_SECRET);
            const userId = decoded.id;
            const user = yield user_1.default.findById(userId);
            if (!user)
                return res.status(404).json({ message: "UNAUTHENTICATED. (user not found)" });
            req.user = user;
            return next();
        }
        catch (ExtReq) {
            return res.status(401).json({ message: "UNAUTHENTICATED. (invakid token)" });
        }
    }
    return res.status(401).json({ message: "UNAUTHENTICATED (provide a Bearer token)" });
});
