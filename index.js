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
import fileRoutes from "./routes/fileRoutes.js";
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

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.10.31:3000",
  "https://manikanta662001.github.io",
];

dotenv.config(); //loads variables in .env file to process.env
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json()); //Built in Mddleware to Parse JSON payloads
app.use(helmet()); // used to set various http headers from frontend
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); // middleware used for logging the requests
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("ORIGIN:::", origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) === false) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
); // Middleware allows to accept requests from different origins
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
app.use("/file", fileRoutes);

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user is Connected", socket.id);
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
  });
  socket.on(
    "message",
    async ({ roomId, content, from, to, date, time, type, fileLink }) => {
      console.log("MESSAGE::::", {
        roomId,
        content,
        from,
        to,
        date,
        time,
        type,
        fileLink,
      });
      const singleMessage = {
        content,
        from,
        to,
        time,
        date,
        type,
      };
      if (type === "image") singleMessage.fileLink = fileLink;
      const roomPresent = await MessageModel.findOne({ roomId });
      if (roomPresent) {
        roomPresent.messages.push(singleMessage);
        const updated = await roomPresent.save();
      } else {
        const newMessage = await MessageModel({
          messages: singleMessage,
          roomId,
        });
        await newMessage.save();
      }
      //to send message to a particular roomId
      io.to(roomId).emit("message", singleMessage);
      const activeRoom = io.sockets.adapter.rooms.get(roomId);
      if (!activeRoom || activeRoom.size < 2) {
        const receipientUser = await Usermodel.findById(from.id);
        receipientUser.messageCount = (receipientUser.messageCount || 0) + 1;
        await receipientUser.save();
        io.emit("msgCount", {
          from: receipientUser._id,
          receipientUser: receipientUser,
        });
      }
      //change the Friends array of UserModel
      const currentUser = await Usermodel.findById(from.id);
      const clonedObj = [...currentUser.friends];
      const selectedUserIndex = clonedObj.findIndex((id) => id === to.id);
      if (selectedUserIndex !== 0) {
        const friend = clonedObj.splice(selectedUserIndex, 1);
        clonedObj.unshift(friend[0]);
        currentUser.friends = clonedObj;
        await currentUser.save();
      }
    }
  );
  socket.on("allmsgs", async ({ roomId }) => {
    const allMsgs = await MessageModel.findOne({ roomId });
    io.to(roomId).emit("getallmsgs", { messages: allMsgs?.messages ?? [] });
  });
  socket.on("msgtyping", async ({ roomId, to }) => {
    io.to(roomId).emit("msgtyping", { roomId, to });
  });
  socket.on("msgnottyping", async ({ roomId, to }) => {
    io.to(roomId).emit("msgnottyping", { roomId, to });
  });

  socket.on("clearMsgCount", async ({ roomId, userId }) => {
    const receipientUser = await Usermodel.findById(userId);
    receipientUser.messageCount = 0;
    await receipientUser.save();
    io.emit("msgCount", {
      from: receipientUser._id,
      receipientUser: receipientUser,
    });
  });

  socket.on("updateLastSeen", async ({ selectedId, lastSeen }) => {
    const receipientUser = await Usermodel.findById(selectedId);
    receipientUser.lastSeen = lastSeen;
    await receipientUser.save();
    io.emit("updateLastSeen", {
      id: receipientUser._id,
      receipientUser: receipientUser,
    });
  });
  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`PORT is Running under : ${PORT}`);
});
