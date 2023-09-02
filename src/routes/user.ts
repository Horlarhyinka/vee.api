import { Router } from "express";
import auth from "../middlewares/auth";
import * as user from "../controllers/user";

const router = Router()


router.get("/me", auth, user.getProfile)
router.get("/", auth, user.getUsers)
router.get("/:userId", auth, user.getUser)
router.put("/me", auth, user.updateProfile)

export default router;