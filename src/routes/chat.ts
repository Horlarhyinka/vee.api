import { Router } from "express";
import * as chat from "../controllers/chat";
import auth from "../middlewares/auth";
import validateId from "../middlewares/validateId";

const router = Router()

router.get("/", auth, chat.getChats)
router.get("/:chatId", validateId, auth, chat.getChat)
router.post("/", auth, chat.addChat)
router.delete("/:chatId", validateId, auth, chat.deleteChat)

export default router;