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
import MessageModel from "./models/Messagemodel.js";

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

/* SERVER FOR CHATS */
import { Server } from "socket.io";
import http from "http";
import { formatTime, getFullName } from "./utils/utils.js";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user is Connected", socket.id);
  socket.on("message", async ({ roomId, content, from, to, date }) => {
    console.log("MESSAGE::::", { roomId, content, from, to, date });
    const singleMessage = {
      content,
      from: { name: getFullName(from), id: from._id },
      to: { name: getFullName(to), id: to._id },
      time: formatTime(date),
      date,
    };
    const roomPresent = await MessageModel.findOne({ roomId });
    if (roomPresent) {
      roomPresent.messages.push(singleMessage);
      const updated = await roomPresent.save();
      console.log("UPDATED:::", updated, roomPresent);
    } else {
      const newMessage = await MessageModel({
        messages: singleMessage,
        roomId,
      });
      const savedMessage = await newMessage.save();
    }
    socket.broadcast.emit("message", singleMessage);
  });
  socket.on("allmsgs", async ({ roomId }) => {
    const allMsgs = await MessageModel.findOne({ roomId });
    io.emit("getallmsgs", { messages: allMsgs?.messages ?? [] });
  });

  socket.on("disconnect",()=>{
    console.log('Client Disconnected')
  })
});

server.listen(PORT, () => {
  console.log(`PORT is Running under : ${PORT}`);
});
