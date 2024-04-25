import { Request, Response } from "express";
import Video from "../models/Video";

export const renderUploadPage = async (req: Request, res: Response) => {
  try {
    const latestVideo = await Video.findOne().sort({ _id: -1 });
    res.render("upload", { videoUrl: latestVideo ? latestVideo.videoUrl : "" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
export const renderWatchPage = (req: Request, res: Response) => {
  res.render("watch", { videoUrl: "" });
};
