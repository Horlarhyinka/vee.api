import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export default ()=> mongoose.connect(String(process.env.DB_URL!))