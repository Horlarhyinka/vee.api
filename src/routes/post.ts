import { Router } from "express";
import * as post from "../controllers/post";
import auth from "../middlewares/auth";
import validateId from "../middlewares/validateId";

const router = Router()

router.get("/", auth, post.getPosts)
router.get("/:postId", validateId, auth, post.getPost)
router.delete("/:postId", auth, validateId, post.deletePost)

export default router;