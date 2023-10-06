import "express-async-errors";
import express, {Request, Response, NextFunction} from "express";
import { createServer } from "https";
import fs from "fs"
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/connectDB";
import useSocket from "./services/socket";

import chatRouter from "./routes/chat"
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import userRouter from "./routes/user";
import dotenv from "dotenv"
import path from "path";

dotenv.config()

const app: express.Application = express();
// const server = createServer({
//     key: fs.readFileSync(path.resolve(__dirname, "../cert/key.pem")),
//     cert: fs.readFileSync(path.resolve(__dirname, "../cert/cert.pem")),
// },app);
const server = createServer(app)

app.set("trust proxy", false)

app.use(cors({
    origin: process.env.NODE_ENV==="production"?String(process.env.CLIENT_URL): "http://localhost:3000"
}))
app.use(helmet())
app.use(rateLimit({
    'windowMs': 15*60*60,
    max: 150,
    message: "too many requests, slow down..."
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

useSocket(server)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/chats", chatRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)

function start(){
    connectDB().then(()=>{
        console.log("connected to db")
    }).catch(ex=>{
        console.log("failed to connect to db", ex)
        process.exit(1)
    })
server.listen(8000,()=>{
    console.log("server listening on port 8000!!!")
})
}

start()
