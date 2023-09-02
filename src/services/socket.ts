import { Server} from "http";
import { Namespace, Socket, Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";
import { user_int } from "../models/types/user.types";
import { chat_int } from "../models/types/chat.types";
import { file_int } from "../models/types/message.types";
import Chat from "../models/chat";

dotenv.config()

type file_type = {name: string, size: string, url: string, thumbnail: string}
type message_type = {body: string, file?: file_type, chatId: string}
type post_type = {body: string, file: file_type, replyTo?: string}

interface client_to_server_events{
    message: (data: message_type)=>void
    post: (data: post_type)=>void
    read: (data:{chatId: string})=>void
}

interface server_to_client_events{
    client_error: (err:Error)=>void 
    message: (data: message_type)=>void
    post: (data: post_type)=>void
    read: (data:{chatId: string})=>void
}

interface interserver_events{

}

interface socket_data{
    
}

const tracker:{[socketId: string]: user_int} = {}

export default (server: Server) =>{
    try{

    const io = new SocketServer<client_to_server_events, server_to_client_events, interserver_events, socket_data>(server, {cors:{
        origin: process.env.CLIENT_URL!
    }})
    const ns:Namespace = io.of("/")
    const postsID = "0000.00.000.0000";

    io.use(async(socket: Socket, next:(ex?: Error)=>void)=>{
        const token = socket.handshake.auth.token
        const err = new Error("UNAUTHENTICATED")
        if(!token)return next(err)
        const payload = jwt.verify(token, process.env.APP_SECRET!) as any;
        const user = await User.findById(payload.id)
        if(!user)return next(err)
        user.socketId = socket.id
        console.log(socket, "thats my damn socket...", socket.id)
        user.online = true;
        await user.save()
        next()
    })

    ns.on("connection", async(socket)=>{
        socket.join(postsID)
        const user = await User.findOne({socketId: socket.id});
        if(!user)return emitError();
        (user.chats as chat_int[]).map(chat=>socket.join(String(user.chats)))
        tracker[socket.id] = user;

        socket.on("message",async(data: message_type)=>{
            const user = getUser(socket.id)
            const targetChat = user?.chats.find(c=> String(c) === String(data.chatId))
            if(!targetChat)return emitError(new Error("chat not found"))
            const message = {...data}
            await Chat.findByIdAndUpdate(data.chatId, {messages: {$push: message}})
            ns.to(String(data.chatId)).emit("message", message)
        })

        socket.on("read", async(data: {chatId: string})=>{
            const user = getUser(socket.id)
            const targetChat = user.chats.find(c=>String(c)=== String(data.chatId))
            if(!targetChat)return emitError(new Error("chat not found"))
            const chat = await Chat.findById(targetChat)
            chat?.messages.forEach(message=>{
                if(!message.timestamp.readAt){
                    message.timestamp.readAt = Date.now()
                }
            })
            await chat?.save()
            socket.to(String(data.chatId)).emit("read", {chatId: data.chatId})
        })

        socket.on("post",(data: post_type)=>{
            const user = getUser(String(socket.id))
            const postObj = {...data, postedBy: user._id}
            ns.to(postsID).emit("post")
        })

        socket.on("disconnect", async()=>{
            delete tracker[socket.id]
            const user = getUser(socket.id)
            console.log("before disconnect")
            user.socketId = undefined;
            user.online = false;
            await user.save()
        })


        function getUser(socketId: string){
            return tracker[socketId]
        }
        function emitError(err?: Error){
        if(err){
            socket.emit("client_error", err)
        }else{
        const err = new Error("UNAUTHENTICATED (user not found)")
        socket.emit("client_error", err)
        }
        }
    })


}catch(ex){
console.log("socket error", ex)
}}