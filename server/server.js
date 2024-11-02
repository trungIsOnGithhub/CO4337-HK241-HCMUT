const express = require('express');
const dbConnect = require('./config/dbconnect');
require('dotenv').config();
const initRoutes = require('./routes');
const cookieParser = require('cookie-parser');
const cors =  require('cors');
const socket = require("socket.io");

const app = express();
app.use(cors({
    origin: '*',
    methods: ['POST', 'PUT', 'DELETE', 'GET'],
    credentials: true
}))
app.use(cookieParser())
// const port = ;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
initRoutes(app)

app.use('/', (req,res) => {res.send('SERVER ON')})

app.listen(5000, ()=>{});
