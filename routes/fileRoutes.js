import express from "express";
import { getFile, uploadFile } from "../controllers/file.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post("/", upload.single("picture"), uploadFile);
router.get("/:id", getFile);

export default router;
