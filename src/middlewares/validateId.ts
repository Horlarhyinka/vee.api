import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export default (req: Request, res: Response, next: NextFunction)=>{
    for(let field of Object.keys(req.params)){
        if(field.toLowerCase().endsWith("id")){
            if(!mongoose.Types.ObjectId.isValid(req.params[field]))return res.status(400).json({message: "invalid " + field})
        }
    }
    next()
}