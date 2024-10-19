import express from "express";
import { forgotPwd1, forgotPwd2, forgotPwd3, login } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgotpassword1", forgotPwd1);
router.post("/forgotpassword2", forgotPwd2);
router.post("/forgotpassword3", forgotPwd3);

export default router;