"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const connectDB_1 = __importDefault(require("./config/connectDB"));
const socket_1 = __importDefault(require("./services/socket"));
const chat_1 = __importDefault(require("./routes/chat"));
const auth_1 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
//using middlewares
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"]
}));
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({
    'windowMs': 15 * 60 * 60,
    max: 150,
    message: "too many requests, slow down..."
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, socket_1.default)(server);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/chats", chat_1.default);
app.use("/api/v1/posts", post_1.default);
function start() {
    (0, connectDB_1.default)().then(() => {
        console.log("connected to db");
    }).catch(ex => {
        console.log("failed to connect to db", ex);
        process.exit(1);
    });
    server.listen(8000, () => {
        console.log("server listening on port 8000!!!");
    });
}
start();
