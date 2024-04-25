import express from "express";
import {
  renderUploadPage,
  renderWatchPage,
} from "../controllers/pageController";
import { uploadVideo, playVideo } from "../controllers/uploadController";
import { convertToHLS } from "../controllers/convertController";
import { uploadMiddleware } from "../middlewares/multerConfig";

const router = express.Router();

router.get("/upload", renderUploadPage);
router.post("/upload", uploadMiddleware, uploadVideo);
router.post("/convertToHLS", convertToHLS);
router.get("/watch", renderWatchPage);
router.post("/watch", playVideo);

export default router;