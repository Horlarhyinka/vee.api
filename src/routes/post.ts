import { Router } from "express";
import * as post from "../controllers/post";
import auth from "../middlewares/auth";

const router = Router()

router.get("/", auth, post.getPosts)
router.get("/:postId", auth, post.getPost)
router.get("/:postId", auth, post.deletePost)

export default router;