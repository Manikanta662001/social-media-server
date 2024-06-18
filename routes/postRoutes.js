import express from "express";
import { getFeedPosts, getUserPosts, likePost, addCommentToPost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
/* READ */

router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

router.patch('/:postId/comment', verifyToken, addCommentToPost)

export default router;
