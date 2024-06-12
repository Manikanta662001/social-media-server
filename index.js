import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { verifyToken } from "./middleware/verifyToken.js";
import Usermodel from "./models/Usermodel.js";
import { posts, users } from "./data/index.js";
import Postmodel from "./models/Postmodel.js";
import { getUser } from "./controllers/users.js";

/* CONFIGURATION */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log({ __filename, __dirname });

dotenv.config(); //loads variables in .env file to process.env
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json()); //Built in Mddleware to Parse JSON payloads
app.use(helmet()); // used to set various http headers from frontend
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); // middleware used for logging the requests
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors()); // Middleware allows to accept requests from different origins
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "@" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/createPost", verifyToken, upload.single("picture"), createPost);

app.get("/getUser", verifyToken, getUser);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* Database Connection */
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MONGODB is Connected");
    /* ADD DATA ONE TIME */
    // Usermodel.insertMany(users);
    // Postmodel.insertMany(posts);
  })
  .catch((err) => console.log("MONGODB Error", err.message));

app.get("/get", (req, res) => {
  return res.json("Hiii");
});

app.listen(PORT, () => {
  console.log(`PORT is Running under : ${PORT}`);
});
