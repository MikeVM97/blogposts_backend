import express from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import userRoutes from "./routes/user.routes";
import dbRoutes from "./routes/db.routes";

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

/* GET DB DATA */
app.post('/users', async (req, res) => {
  try {
    const usersDB = await UserModel.find({});
    return res.json(usersDB);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Un error ha ocurrido: ' + error.message });
    }
  }
});

/* ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use('/delete', dbRoutes);

/* SEND HTML TEXT EXAMPLE */
app.get('/', (req, res) => {
  return res.send('<h1 style="text-align: center;">Welcome to my Backend Application</h1>');
});

/* SEND HTML FILE EXAMPLE */
const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('/public', (req, res) => {
  return res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, function() {
  console.log(`Backend is running on port ${PORT}`);
});