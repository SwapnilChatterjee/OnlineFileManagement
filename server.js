const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors =  require('cors')
require('dotenv').config()
console.log(typeof(process.env.DB_URL))
var logger = require('morgan');
var session = require('express-session');
const { Cookie } = require('express-session')
var passport = require('passport');
var MongoStore = require('connect-mongo');
const { router, isAuth } = require('./router/routes')
// var isAuth = require(__dirname+"/router/routes.js")
// const {clientRoutes,} = require(__dirname+"/router/routes.js")

app.use(cors())
// app.use(logger("combined"))
app.use(express.static(__dirname+"/public"))
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    secret:"abcd",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge : 1000 * 60 * 60
    }
}));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
app.use(passport.authenticate('session'));
app.use(passport.initialize())
app.use(passport.session())
//Middleware to access infomation of forms i.e accessing the body of a request
app.use(express.urlencoded({ extended : true }))
//setting view engine
app.set('view engine', 'ejs')
app.use(express.static(__dirname+"/uploads"))

app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/public/welcome.html")
    console.log("Server is running!!!")
})

//EXPRESS ROUTER

app.use("/client", router)
mongoose.set('strictQuery', false)
mongoose.connect(process.env.DB_URL)
    .then(()=>{
        app.listen((process.env.PORT || 8000), ()=>{
            console.log("CONNECTED TO DATABASE AND LISTENING")
        })
    })
    .catch((err)=>{
        console.log(err)
    })

    
