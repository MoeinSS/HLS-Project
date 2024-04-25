import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import indexRouter from "./routes/index";

dotenv.config();
mongoose.set("strictQuery", false);
const app = express();
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/", indexRouter);
app.use("/hls", express.static(path.join(__dirname, "public", "hls")));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server started at", new Date());
});
export default app;
