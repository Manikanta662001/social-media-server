import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
});
const FileModel = new mongoose.model("File", fileSchema);
export default FileModel;
