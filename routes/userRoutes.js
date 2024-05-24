import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addRemoveFriends,
  getUser,
  getUserFriends,
} from "../controllers/users.js";
const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriends);

export default router;
