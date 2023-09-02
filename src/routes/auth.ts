import { Router, Request, Response } from "express";
import * as auth from "../controllers/auth";


const router = Router();


router.post("/register", auth.register)
router.post("/login", auth.login)
router.post("/forget-password", auth.forgetPassword)
router.patch("/forget-password/:token", auth.resetPassword)

export default router;