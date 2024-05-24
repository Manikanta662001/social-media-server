import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import STATUS_TYPES from "../utils/constants.js";

dotenv.config();
export const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.Authorization;
    if (!token)
      return res
        .status(STATUS_TYPES.FORBIDDEN)
        .json({ error: "Token Not Found" });
    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }
    const tokenMatchecd = jwt.verify(token, process.env.JWT_SECRET);
    req.user = token;
    next();
  } catch (error) {
    res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
