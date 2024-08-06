import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Usermodel from "../models/Usermodel.js";
import STATUS_TYPES from "../utils/constants.js";
import nodemailer from "nodemailer";

/* Send Mail  */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gundlurimanikanta142@gmail.com",
    pass: "iucn ctzk xpvf grlw",
  },
});
dotenv.config();
/* REGISTER */
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
      picturePath: filename,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com",
      to: email,
      subject: "Social-Media Registration",
      html: `
      Hii <em>${user.firstName}</em>,
      <p>Your Registration Successful</p>
      <br/>
      <h6>Thank You</h6>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(STATUS_TYPES.SERVER_ERROR).send(error.toString());
      }
      return res
        .status(STATUS_TYPES.CREATED)
        .json({
          user: savedUser,
          message: "User Registered Successfully and Email Sent",
        });
    });
  } catch (error) {
    res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};

/* LOGIN */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Usermodel.findOne({ email });
    if (!user)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "User Not Found" });
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "Invalid Credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    //we don't need to send the pwd to frontend
    delete user.password;
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com",
      to: email,
      subject: "Social-Media Login",
      html: `
      Hii <em>${user.firstName}</em>,
      <p>Login Successful.</p>
      <br/>
      <h6>Thank You</h6>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(STATUS_TYPES.SERVER_ERROR).send(error.toString());
      }
      return res
        .status(STATUS_TYPES.OK)
        .json({ user, token, message: "Login Successful" });
    });
  } catch (error) {
    return res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
