import mongoose from "mongoose";
import { user_int } from "./types/user.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import post from "./post";

dotenv.config()

const userSchema = new mongoose.Schema<user_int>({
    username:{ type: String, required: [true, "username is required"], minlength: 3},
    email: {type: String, required: [true, "email is required"], unique: true, match: /^([a-z0-9\.@\-]{3,})@([a-z@\.])+\.([a-z0-9]{2,})$/i},
    password: { type: String, required: [true, "password is required"], minlength: 6 },
    chats: { type: [mongoose.Schema.Types.ObjectId], ref: "chat", default: [] },
    posts: { type: [mongoose.Schema.Types.ObjectId], ref: "post"},
    token: { type: String},
    tokenExpiresIn: {type: Date},
    online: {type: Boolean, default: false},
    socketId: { type: String, default: undefined },
    about: {type: String},
    avatar: {type: String},
})

userSchema.pre("save",async function(next){
    const salt = await bcrypt.genSalt()
    const hashed = await bcrypt.hash(this.password, salt)
    this.password = hashed
    next()
})

userSchema.methods.generateToken = function(){
    const payload = {id: (this as user_int)._id}
    return jwt.sign(payload , String(process.env.APP_SECRET!))
};

userSchema.methods.comparePassword = function(password: string){
    return bcrypt.compare(password, (this as user_int).password)
}

export default mongoose.model("user", userSchema)