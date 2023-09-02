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
exports.sendPasswordResetToken = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    host: "smtp.mailtrap.io",
    port: 465,
    service: "mailtrap"
});
function sendMail(reciever, html) {
    return transporter.sendMail({
        to: reciever,
        from: process.env.MAIL_ADDRESS,
        html
    });
}
const sendPasswordResetToken = (email, link) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filepath = path_1.default.resolve(__dirname, "../views/forget-password.ejs");
        const html = yield ejs_1.default.renderFile(filepath, { url: link });
        yield sendMail(email, html);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.sendPasswordResetToken = sendPasswordResetToken;
