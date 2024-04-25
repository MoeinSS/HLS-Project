import mongoose, { Document, Schema } from "mongoose";

export interface VideoModel extends Document {
  title: string;
  description: string;
  videoUrl: string;
}
const VideoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
});
const Video = mongoose.model<VideoModel>("Video", VideoSchema);
export default Video;
