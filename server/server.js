const express = require('express');
const dbConnect = require('./config/dbconnect');
require('dotenv').config();
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors =  require('cors')
const socket = require("socket.io")

const app = express();
app.use(cors({
    origin: '*',
    methods: ['POST', 'PUT', 'DELETE', 'GET'],
    credentials: true
}))
app.use(cookieParser())
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
dbConnect()
initRoutes(app)

app.use('/', (req,res) => {res.send('SERVER ON')})

const server = app.listen(port,()=>{

});

const io = socket(server,{
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

global.onlineUsers = new Map()

io.on("connection", (socket) => {
    global.chatSocket = socket
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    })
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve", data.message)
        }
    })
})
