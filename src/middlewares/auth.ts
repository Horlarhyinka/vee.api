import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import { user_int } from "../models/types/user.types";

dotenv.config()

interface ExtReq extends Request{
    user: user_int
}

export default async(req: Request, res: Response, next: NextFunction) =>{
    const token = req.headers.authorization;
    if(token?.toLowerCase().startsWith("bearer")){
        const splitted = token.split(" ")
        const key = splitted[1]
        if(!key)return res.status(401).json({message: "UNAUTHENTICATED (provide a valid token)"})
        try {
        const decoded = jwt.verify(key, process.env.APP_SECRET!) as {id: string}
        const userId = decoded.id
        const user = await User.findById(userId);
        if(!user)return res.status(404).json({message: "UNAUTHENTICATED. (user not found)"});
        (req as ExtReq).user = user;
        return next()
        } catch (ExtReq) {
            return res.status(401).json({message: "UNAUTHENTICATED. (invakid token)"})
        }

    }
    return res.status(401).json({message: "UNAUTHENTICATED (provide a Bearer token)"})
}