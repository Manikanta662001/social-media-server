import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usermodel from "../models/Usermodel.js";
import STATUS_TYPES from "../utils/constants.js";

export const register = async (req, res) => {
  try {
    const { filename } = req.file;
    let { user } = req.body;
    user = JSON.parse(user);

    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = user;
    console.log(user);
    const emailExist = await Usermodel.findOne({ email });
    if (emailExist) {
      return res
        .status(STATUS_TYPES.DUPLICATE_KEY)
        .json({ error: "Email alredy exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usermodel({
      ...user,
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
