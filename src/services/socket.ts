import { Server} from "http";
import { Namespace, Socket, Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";
import { user_int } from "../models/types/user.types";
import { chat_int } from "../models/types/chat.types";
import { file_int } from "../models/types/message.types";
import Chat from "../models/chat";
import Post from "../models/post"
import post from "../models/post";

dotenv.config()

type file_type = {name: string, size: string, url: string, thumbnail: string}
type message_type = {body: string, file?: file_type, chatId: string, sentBy: string}
type post_type = {body: string, file: file_type, replyTo?: string}

interface client_to_server_events{
    message: (data: message_type)=>void
    post: (data: post_type)=>void
    read: (data:{chatId: string})=>void
    new_chat: (data: {userId: string, chatId: string})=>void
    like: (data: {postId: string})=>void
    comment: (data: {postId: string, comment: post_type}) =>void
}

interface server_to_client_events{
    client_error: (err:Error)=>void 
    message: (data: message_type)=>void
    post: (data: post_type)=>void
    read: (data:{chatId: string})=>void
    logout: ()=>void
}

interface interserver_events{
    
}

interface socket_data{
    
}

const tracker:{[socketId: string]: user_int} = {}

export default (server: Server) =>{
    try{

    const io = new SocketServer<client_to_server_events, server_to_client_events, interserver_events, socket_data>(server, {cors:{
        origin: process.env.NODE_ENV==="production"?String(process.env.CLIENT_URL): "http://localhost:3000"
    }})
    const ns:Namespace = io.of("/")
    const postsID = "0000.00.000.0000";

    io.use(async(socket: Socket, next:(ex?: Error)=>void)=>{
        try{
        const token = socket.handshake.auth.token
        const err = new Error("UNAUTHENTICATED")
        if(!token)return next(err)
        const payload = jwt.verify(token, process.env.APP_SECRET!) as any;
        const user = await User.findById(payload.id)
        if(!user)return next(err)
        user.socketId = socket.id
        user.online = true;
        await user.save()
        tracker[socket.id] = user;
        next()

        }catch(ex){
            io.to(socket.id).emit("logout")
        }
    })

    ns.on("connection", async(socket)=>{
        const user = await User.findOne({socketId: socket.id});
        if(!user)return emitError();
        socket.join(postsID);
        (user.chats as chat_int[]).map(chat=>socket.join(String(chat)))

        socket.on("message",async(data: message_type)=>{
        try{
            let user = await (getUser(socket.id) as user_int).populate("chats")
            let targetChat = (user?.chats as chat_int[]).find(c=> String(c._id) === String(data.chatId))
            if(!targetChat){
              const updatedUser = await User.findById(user._id).populate("chats") 
              if(updatedUser){
                tracker[String(socket.id)] = updatedUser
              } 
              targetChat = (updatedUser?.chats as chat_int[]).find(c=> String(c._id) === String(data.chatId))
            }
            if(!targetChat)return emitError(new Error("chat not found"))
            const message = {...data, sentBy: user._id}
            targetChat.set("messages", [...targetChat.messages, message])
            await targetChat.save()
            if(!socket.rooms.has(String(data.chatId))){
                socket.join(String(data.chatId))
            }
            ns.to(String(data.chatId)).emit("message", message)
        }catch(ex){
            console.log(ex)
        }
        })

        socket.on("read", async(data: {chatId: string})=>{
            const user = getUser(socket.id)
            const targetChat = user.chats.find(c=>String(c)=== String(data.chatId))
            if(!targetChat)return emitError(new Error("chat not found"))
            const chat = await Chat.findById(targetChat)
            for(let i = chat!.messages.length - 1; i > 0; i--){
                if(chat!.messages[i].timestamp.readAt)break;;
                chat!.messages[i].timestamp.readAt = Date.now()
            }

            socket.to(String(chat!._id)).emit("read", {chatId: data.chatId})
        })

        socket.on("post",async(data: post_type)=>{
            const user = getUser(String(socket.id))
            const postObj = {...data, postedBy: user._id}
            const post = await Post.create(postObj)
            user.posts.push(post?._id)
            await user.save()
            if(data.replyTo){
                const originalPost = await Post.findById(String(data.replyTo))
                originalPost?.comments.push(String(user._id))
                await originalPost?.save()
            }
            ns.to(postsID).emit("post", post)
        })

        socket.on("new_chat", async(data:{userId: string, chatId: string})=>{
            const user = await User.findById(String(data.userId))
            if(!user)return
            if(!socket.rooms.has(String(data.chatId)))return
            const sockets = await io.sockets.fetchSockets()
            const target = sockets.find(s=>String(s.id)===String(user.socketId))
            if(!target)return;
            target.join(data.chatId)
        })

        socket.on("like",async(data)=>{
            const user = getUser(socket.id)
            const post = await Post.findById(data.postId)
            if(!post)return
            if(post.likes.includes(String(user._id))){
                post.likes = post.likes.filter(l=>String(l) !== String(user._id))
            }else{
                post.likes.push(String(user._id))
            }
            await post.save()
            ns.to(postsID).emit("like", {postId: String(post._id), userId: String(user._id)})
        })

        socket.on("comment", async(data)=>{
            const user = getUser(socket.id)
            const post = await Post.findById(data.postId)
            if(!post)return
            const newPost = await Post.create({...data.comment, replyTo: String(post._id)})
            ns.to(postsID).emit("comment", {post: newPost, userId: String(user._id) })
        })

        socket.on("disconnect", async()=>{
            delete tracker[socket.id]
            const user = getUser(socket.id)
            if(user){
            user.socketId = undefined;
            user.online = false;
            await user.save()
            }
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