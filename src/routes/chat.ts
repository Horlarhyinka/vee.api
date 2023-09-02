import { Router } from "express";
import * as chat from "../controllers/chat";
import auth from "../middlewares/auth"

const router = Router()

router.get("/", auth, chat.getChats)
router.get("/:chatId", auth, chat.getChat)
router.post("/", auth, chat.addChat)
router.delete("/:chatId", auth, chat.deleteChat)

export default router;