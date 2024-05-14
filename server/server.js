const express = require('express');
const dbConnect = require('./config/dbconnect');
require('dotenv').config();
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors =  require('cors')

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

app.listen(port,()=>{

});
