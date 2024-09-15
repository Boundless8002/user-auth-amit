import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();
import cookieParser from "cookie-parser";
import { UserRouter } from "./routes/UserRoutes.js";

const port = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: "https://user-auth-front-amit-gd47.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

app.use(cookieParser());
app.use("/auth", UserRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
