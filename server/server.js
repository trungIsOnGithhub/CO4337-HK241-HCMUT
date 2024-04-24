const express = require('express');
const dbConnect = require('./config/dbconnect');
require('dotenv').config();
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors =  require('cors')

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'DELETE', 'GET'],
    credentials: true
}))
app.use(cookieParser())
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
dbConnect()
initRoutes(app)

app.use('/', (req,res) => {res.send('SERVER ONNNN')})

app.listen(port,()=>{
    console.log("Server running on the port: " + port)
});
