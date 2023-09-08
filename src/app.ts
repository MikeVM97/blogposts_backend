import express from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import userRoutes from "./routes/user.routes";

import UserModel from "./models/user.model";

import connectDB from "./mongodb";

import "dotenv/config";
// import { Server } from "socket.io";
// import http from "http";

connectDB();

const app = express();

// const server = http.createServer(app);

/* const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
    ? "https://tuapp.com"
    : "http://localhost:5173",
    credentials: true,
  }
}); */

const URL = process.env.NODE_ENV === "production"
? "https://blogposts-frontend.vercel.app"
: "http://localhost:5173";

const PORT = Number(process.env.PORT) || 8080;

const corsOptions: CorsOptions = {
  origin: URL,
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/users', (_req, res) => {
  UserModel.find({})
  .then(users => res.json(users))
  .catch(err => console.log(err));
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, function () {
  console.log(`Backend is running on port ${PORT}`);
});