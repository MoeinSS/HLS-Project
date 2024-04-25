import Video from "../models/Video";
import { Request, Response } from "express";
import { convertToHLS } from "./convertController";

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    console.log("Uploading video...");
    const { title, description } = req.body;
    if (!req.file) {
      console.log(req.file);
      console.log("No file uploaded.");
      return res.status(400).send("No file uploaded.");
    }
    const videoUrl = req.file.filename;
    const video = new Video({
      title,
      description,
      videoUrl,
    });
    await video.save();
    console.log("Video saved to database.");
    const mockReq = {
      body: { videoUrl },
    } as Request;
    await convertToHLS(mockReq, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
export const playVideo = (req: Request, res: Response) => {
  const { videoUrl } = req.body;
  res.render("watch", { videoUrl });
};
