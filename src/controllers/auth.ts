import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import catchMongooseErr from "../utils/handleMongooseErr";
import crypto from "crypto"
import { sendPasswordResetToken } from "../services/mailer";
import dotenv from "dotenv";

dotenv.config()

export const register = catchAsyncErrors(async(req:Request, res: Response, next: NextFunction)=>{
    try {
    const newUser = await User.create({...req.body})
    const token = newUser.generateToken()
    newUser.password = ""
    return res.status(201).json({message: "successful", data: {user:newUser, token}})
    } catch (ex: any) {
        const message = catchMongooseErr(ex)
        if(!message)return res.status(500).json({message: "failed to register"})
        res.status(401).json({message})
    }
})

export const login = catchAsyncErrors(async(req: Request, res: Response)=>{
    const {email, password} = req.body;
    if(!email || !password) return res.status(401).json({message: "email and password is required"})
    const user = await User.findOne({email})
    if(!user)return res.status(404).json({message: "user not found"})
    const validatePwd = await user.comparePassword(password);
    if(!validatePwd)return res.status(401).json({message: "incorrect password"});
    const token = user.generateToken()
    user.password = ""
    return res.status(200).json({message: "successful", data: {user, token}})
})

export const forgetPassword = catchAsyncErrors(async(req: Request, res: Response)=>{
    const {email} = req.body;
    if(!email)return res.status(401).json({message: "email is required"})
    const user = await User.findOne({email})
    if(!user)return res.status(404).json({message: "email not found"})
    const token = crypto.randomBytes(11).toString("hex")
    user.token = token;
    user.tokenExpiresIn = new Date(Date.now() + 2 * 1000 * 60 * 60)
    await user.save()
    const url = `${process.env.CLIENT_URL}/forget-password/${token}`;
    const mailResponse = await sendPasswordResetToken(user.email, url);
    if(!mailResponse)return res.status(501).json({message: "email service down"})
    return res.status(204).json({message: "succesful", data: "null"})
})

export const resetPassword = catchAsyncErrors(async(req: Request, res: Response)=>{
    const token = req.params.token;
    const user = await User.findOne({token, tokenExpiresIn:{$gte: new Date()}})
    if(!user)return res.status(401).json({message: "invalid token"})
    const {newPassword} = req.body;
    if(!newPassword)return res.status(400).json({message: "provide a new password"})
    user.password = newPassword;
    user.token = undefined;
    user.tokenExpiresIn = undefined;
    const updatedUser = await user.save()
    const authToken = updatedUser.generateToken()
    user.password = ""
    return res.status(200).json({message: "successful", data: {user, token: authToken}})
})