import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usermodel from "../models/Usermodel";
import STATUS_TYPES from "../utils/constants";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usermodel({
      ...req.body,
      password: hashedPassword,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    return res.status(STATUS_TYPES.CREATED).json(savedUser);
  } catch (error) {
    res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
