import Postmodel from "../models/Postmodel.js";
import Usermodel from "../models/Usermodel.js";
import STATUS_TYPES from "../utils/constants.js";

export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    let name;
    if (req?.file){
      const {filename} = req?.file;
      name = filename;
    }
    console.log('POST::::',userId,name)
    //findById() Retrieve the single document or record with the specified userId(_id) of mongodb
    const user = await Usermodel.findById(userId);
    const incomingPost = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      likes: [],
      comments: {},
    }
    if (name) incomingPost.picturePath = name;
    const newPost = await Postmodel(incomingPost);
    await newPost.save();
    //find() Retrieve all documents or records from the 'posts' collection
    const allDbPosts = await Postmodel.find();
    return res.status(STATUS_TYPES.CREATED).json({allDbPosts,message:'Post Created Successfully'});
  } catch (error) {
    console.log("ERR1:::",error.message)
    return res.status(STATUS_TYPES.BAD_REQUEST).json({ error: error.message });
  }
};
/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Postmodel.find();
    return res.status(STATUS_TYPES.OK).json(posts);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    //returns the records that contain the exact userId
    const posts = await Postmodel.find({ userId });
    return res.status(STATUS_TYPES.OK).json(posts);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Postmodel.findById(id);
    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }
    const updatedPost = await Postmodel.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );
    return res.status(STATUS_TYPES.OK).json(updatedPost);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
