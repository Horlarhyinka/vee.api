import "express-async-errors";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/connectDB";
import useSocket from "./services/socket";

import chatRouter from "./routes/chat"
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import userRouter from "./routes/user";

const app: express.Application = express();
const server = createServer(app);

//using middlewares
app.use(cors({
    origin: ["http://localhost:3000"]
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
