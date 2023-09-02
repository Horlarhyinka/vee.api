import { Request, Response, NextFunction } from "express";

export default (fn: Function) =>{
    return (req: Request, res: Response, next: NextFunction)=>{
    try{
        fn(req, res)
    }catch(ex){
        console.log(ex)
        next()
    }
    }
}

