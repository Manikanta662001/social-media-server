import Usermodel from "../models/Usermodel.js";
import STATUS_TYPES from "../utils/constants.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Usermodel.findById(id);
    return res.status(STATUS_TYPES.OK).json(user);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usermodel.findById(id);
    return res.status(STATUS_TYPES.OK).json(user);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usermodel.findById(id);
    const allfriends = await Promise.all(
      user.friends.map((id) => Usermodel.findById(id))
    );
    const formatedFriends = allfriends.map(
      ({
        _id,
        firstName,
        lastName,
        email,
        occupation,
        location,
        picturePath,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          email,
          occupation,
          location,
          picturePath,
        };
      }
    );
    return res.status(STATUS_TYPES.OK).json(formatedFriends);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
export const addRemoveFriends = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await Usermodel.findById(id);
    const friend = await Usermodel.findById(friendId);
    let message='';
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((_id) => _id !== id);
      message='User is Removed from Friends';
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
      message='User is Added to Friends';
    }
    await user.save();
    await friend.save();
    const allfriends = await Promise.all(
      user.friends.map((id) => Usermodel.findById(id))
    );
    // const formatedFriends = allfriends.map(
    //   ({
    //     _id,
    //     firstName,
    //     lastName,
    //     email,
    //     occupation,
    //     location,
    //     picturePath,
    //   }) => {
    //     return {
    //       _id,
    //       firstName,
    //       lastName,
    //       email,
    //       occupation,
    //       location,
    //       picturePath,
    //     };
    //   }
    // );
    const formatedFriends = allfriends.map(({ _id }) => {
      return _id;
    })
    return res.status(STATUS_TYPES.OK).json({ message, formatedFriends });
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
