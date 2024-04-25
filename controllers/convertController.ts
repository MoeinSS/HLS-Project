import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Video from "../models/Video";
import dotenv from "dotenv";

dotenv.config();
const uploadsFolder = process.env.UPLOADS_DIRECTORY || "uploads/";
const hlsOutputDirectory = path.join(process.env.PUBLIC_DIRECTORY || "public/", "hls/");

interface Playlist {
  resolution: string;
  content: string;
}
export const convertToHLS = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Converting video to HLS format...");
    const { videoUrl } = req.body;
    const video = await Video.findOne({ videoUrl });
    if (!video) {
      res.status(404).send("Video not found");
      return;
    }
    const { _id } = video;
    const inputFilePath = `${uploadsFolder}${videoUrl}`;
    const outputDirectory = path.join(hlsOutputDirectory, _id.toString());
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    const qualities = [
      { resolution: "426x240", bitrate: "400k" },
      { resolution: "640x360", bitrate: "800k" },
      { resolution: "854x480", bitrate: "1200k" },
    ];
    const playlists: Playlist[] = [];
    for (const quality of qualities) {
      const { resolution, bitrate } = quality;
      const playlistFileName = `${_id.toString()}_${resolution}.m3u8`;
      const playlistOutputFilePath = path.join(
        outputDirectory,
        playlistFileName
      );
      const ffmpegPath = "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe";
      const args = [
        "-y",
        "-i",
        inputFilePath,
        "-vf",
        `scale=${resolution}`,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-f",
        "hls",
        "-hls_time",
        "10",
        "-hls_list_size",
        "0",
        "-b:v",
        bitrate,
        playlistOutputFilePath,
      ];
      const ffmpegProcess = spawn(ffmpegPath, args);
      ffmpegProcess.stdout.on("data", (data) => {
        console.log(`FFmpeg stdout: ${data}`);
      });
      ffmpegProcess.stderr.on("data", (data) => {
        console.error(`FFmpeg stderr: ${data}`);
      });
      await new Promise<void>((resolve, reject) => {
        ffmpegProcess.on("close", (code) => {
          if (code === 0) {
            console.log(`Video converted to HLS (${resolution}) successfully.`);
            const content = fs.readFileSync(playlistOutputFilePath, "utf-8");
            playlists.push({
              resolution,
              content,
            });
            resolve();
          } else {
            console.error(`FFmpeg process exited with code ${code}`);
            reject(new Error("Error converting video to HLS."));
          }
        });
      });
    }
    const masterPlaylistFilePath = path.join(
      outputDirectory,
      `${_id.toString()}_master.m3u8`
    );
    const masterPlaylistContent = playlists
      .map(
        (playlist) =>
          `#EXT-X-STREAM-INF:BANDWIDTH=${getBandwidth(
            playlist.resolution
          )},RESOLUTION=${playlist.resolution}\n${playlist.content}`
      )
      .join("\n");
    fs.writeFileSync(masterPlaylistFilePath, masterPlaylistContent);
    console.log("Master playlist generated successfully.");
    console.log("All video quality renditions converted successfully to HLS.");
    res.send("Video successfully uploaded and converted to HLS.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
function getBandwidth(resolution: string): number {
  let bitrate;
  switch (resolution) {
    case "426x240":
      bitrate = 400;
      break;
    case "640x360":
      bitrate = 800;
      break;
    case "854x480":
      bitrate = 1200;
      break;
    default:
      bitrate = 0;
  }
  return bitrate * 1024 * 1.2;
}
