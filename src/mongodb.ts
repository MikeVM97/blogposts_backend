import mongoose from "mongoose";
import "dotenv/config";

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;
const dbname = "users";

const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const x = "mongodb://mongo:kkkFHosDlv2ojwE5ybM4@containers-us-west-130.railway.app:7354";

export default async function connectDB() {
  try {
    await mongoose.connect(x);
    console.log("MongoDB is connected");
  } catch (error) {
    console.error(error);
  }
};