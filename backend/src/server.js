import express from "express";
//import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";

//dotenv.config();



const PORT = ENV.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URLS
  .split(",")
  .map(origin => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit : "5mb"})); // for parsing the json data that is comming from body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



server.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
  connectDB();
});
