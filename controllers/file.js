import STATUS_TYPES from "../utils/constants.js";
import FileModel from '../models/FileModel.js'

export const uploadFile = async (req, res) => {
    try {
        const { originalname, buffer, size, mimetype } = req.file;
        const newFile = new FileModel({
            fileName: originalname,
            data: buffer,
            size,
            type: mimetype,
          });
          console.log('FILE::::',newFile);
        await newFile.save();
        return res.status(STATUS_TYPES.CREATED).json(newFile);
    } catch (error) {
      return res.status(STATUS_TYPES.BAD_REQUEST).json({ error: error.message });
    }
  };

export const getFile = async(req,res)=>{
    try {
      const { id } = req.params;
      console.log('GET:::::',id)
      const dbImage = await FileModel.findById(id)
      res.status(STATUS_TYPES.OK).json(dbImage);
  } catch (error) {
    return res.status(STATUS_TYPES.BAD_REQUEST).json({ error: error.message });
  }
  }