import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";

dotenv.config()

const transporter = nodemailer.createTransport({
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    host: "smtp.mailtrap.io",
    port: 465,
    service: "mailtrap"
})

function sendMail(reciever: string, html: string){
    return transporter.sendMail({
        to: reciever,
        from: process.env.MAIL_ADDRESS,
        html
    })
}

export const sendPasswordResetToken = async(email: string, link: string) =>{
    try {
        const filepath = path.resolve(__dirname, "../views/forget-password.ejs")
        const html = await ejs.renderFile(filepath, {url: link})
        await sendMail(email, html)
        return true;
    } catch (error) {
        return false;
    }
}