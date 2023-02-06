//parent url /client
const express = require('express')
const Client = require("../models/model.js")
const path = require('path')
const router = express.Router()
const File = require("../models/fileModels.js")
const shortid = require('shortid')
var LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
var passport = require('passport');
const fs = require('fs')
require('dotenv').config()
//initializing the multer



var UID = ""
const multer = require('multer')
//initializing storage for multer file upload
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads')
    },
    filename: (req, file, callback) => {
        UID = shortid.generate()
        let a = UID.toString()
        callback(null, a + path.extname(file.originalname))
    }

})
//defining the upload middleware to upload
const upload = multer({ storage: storage })

//initializing passport js
passport.use(new LocalStrategy(function verify(username, password, cb) {
    Client.findOne({ username: username })
        .then((user) => {
            if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }) }

            const result = bcrypt.compare(password, user.pass)
            if (result)
                cb(null, user)
            else
                cb(null, false)
        })
        .catch((err) => {
            cb(err)
        })
}));

passport.serializeUser(function (user, cb) {

    cb(null, { id: user.id, username: user.username });

});

passport.deserializeUser(function (user, cb) {

    //   return cb(null, user);
    Client.findById(user.id, function (err, db_user) {
        if (err)
            return cb(err)
        cb(null, db_user)
    })

});

//Authentication Middleware
function isAuth(req, res, next) {
    if (req.isAuthenticated())
        next()
    else
        res.render("clients/autherror", { user: "CLIENT" })
}
//ADMIN AUTHENTICATION MIDDLEWARE
function isAdminAuth(req, res, next) {
    if (req.isAuthenticated() && req.user.username == process.env.ADMIN_USERNAME)
        next()
    else
        res.render("clients/autherror", { user: "ADMIN" })
}

router
    .route("/login")
    .get((req, res) => {
        // console.log(__dirname)
        if (req.isAuthenticated() && req.user.admin)
            res.redirect("/client/admin")
        else if (req.isAuthenticated() && !req.user.admin)
            res.redirect("/client/dashboard")
        else
            res.render("clients/clientLogin", { message: "" })
    })
    .post(
        passport.authenticate('local', {
            successRedirect: '/client/dashboard/',
            failureRedirect: '/client/login/'
        })
    )


router
    .route("/register")
    .get((req, res) => {
        if (req.isAuthenticated())
            res.redirect("/client/dashboard")
        else
            res.render("clients/registrationPage", { message: "" })
    })
    .post((req, res) => {
        // console.log(req.body)
        const name1 = req.body.name
        const username = req.body.username
        const password = req.body.password
        const saltrounds = 10

        //checking whether user with same username already exixts or not
        Client.find((err, clients) => {
            if (err)
                console.log(err)
            else {
                let flag = 0
                const len = clients.length
                for (let i = 0; i < len; i++) {
                    if (clients[i].username == username) {
                        console.log(clients[i])
                        flag = 1
                        break
                    }
                }
                if (flag == 1) {
                    // console.log("USER ALREADY EXISTS GO TO LOGIN PAGE")
                    res.render("clients/registrationPage", { message: "USER ALREADY EXISTS GO TO LOGIN PAGE" })
                }
                else {
                    //if not exist then entering
                    bcrypt.hash(password, saltrounds, function (err, hash) {
                        // Store hash in your password DB.
                        const temp = new Client({
                            name: name1,
                            username: username,
                            pass: hash,
                            admin: false
                        })
                        Client.insertMany([temp], (err) => {
                            if (err)
                                console.log(err)
                            else {
                                // res.render("clients/clientdashboard", { user: username })
                                res.redirect(`/client/login`)
                            }

                        })
                    });

                }
            }
        })

    })

router
    .route("/dashboard/")
    .get(isAuth,(req, res) => {
        if (req.isAuthenticated() && req.user.admin)
            res.redirect("/client/admin")
        else if (req.isAuthenticated() && !req.user.admin)
            res.render("clients/clientdashboard", { user: req.user.username })
        else
            res.redirect("/client/login")
        console.log(req.user)

    })
    .post(upload.single("files"), (req, res) => {
        const userName = req.user.username
        const filename = req.body.filename.split(".")
        const filetype = filename[1]
        const dateANDtime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(",");
        const dateofupload = dateANDtime[0]
        const timeofupload = dateANDtime[1]
        // console.log(req.body)
        // var UID = shortid.generate() 
        let a = UID.toString() + "." + filetype
        const tempFilemodel = new File({
            filename: a,
            date: dateofupload,
            time: timeofupload,
            viewfilename: req.body.filename,
            reported: false
        })
        Client.updateOne({ username: userName }, { "$push": { files: tempFilemodel } }, (err) => {
            if (err)
                console.log("ERROR")
            else {

                console.log(a)
            }

        })
        res.redirect('back');


        // console.log(date)
        // console.log(req.body)

    })

router
    .route("/uploads/:userId")
    .get(isAuth, (req, res) => {
        const userName = req.params.userId
        Client.find({ username: userName }, (err, persons) => {
            if (err)
                console.log(err);
            else {
                const a = persons[0]
                if (persons.length == 0) {
                    res.json([{ "viewfilename": "NO UPLOADS" }])
                }

                else {
                    res.json(a.files)
                }

            }
        })
    })

router
    .route("/downloads/:fileId")
    .get(isAuth, (req, res) => {
        console.log("!!!!DOWNLOAD")
        const filename = req.params.fileId
        res.download(path.join(__dirname, '..', 'uploads', filename))
        // console.log()
    })

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router
    .route("/adminlogin")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "adminlogin.html"))
    })
    .post((req, res) => {
        passport.authenticate('local', {
            successRedirect: '/client/admin/',
            failureRedirect: '/'
        })
    })

router.get("/admin", isAdminAuth, (req, res) => {
    if (req.isAuthenticated() && !req.user.admin)
        res.redirect("/client/dashboard")
    else if (req.isAuthenticated() && req.user.admin)
        res.sendFile(path.join(__dirname, "..", "public", "adminDashboard.html"))
    else
        res.redirect("/client/adminlogin")
    // res.sendFile(path.join(__dirname,"..","public","adminDashboard.html"))
})
router.get('/alluploads', isAdminAuth, (req, res) => {

    let directory_name = path.join(__dirname, "..", "uploads")
    let filenames = fs.readdirSync(directory_name)
    const obj = {}
    filenames.forEach((file) => {
        obj[file] = file
    })
    // console.log(obj)
    res.json(obj)

})

router.get('/delete/:fileID', isAuth, (req, res) => {
    const filename = req.params.fileID
    const username = req.user.username
    console.log(username)
    const directory_name = path.join(__dirname, "..", "uploads")
    fs.unlink(directory_name + "/" + filename, (err) => {
        if (err)
            console.log(err)
        else
            console.log("File Deleted successfully")
    })
    // const filesarray = 
    // Client.updateOne({username: username},{ "$pull" : { files:{ filename: filename } } })
    Client.find({ username: username }, (err, persons) => {
        if (err)
            console.log(err);
        else {
            const a1 = persons[0]
            if (persons.length == 0) {
                res.json({ "viewfilename": "NO UPLOADS" })
            }

            else {
                // res.json(a.files)
                // console.log(a.files)
                let filesArray = a1.files
                let len = filesArray.length
                const a = []
                for (let i = 0; i < len; i++) {
                    if (filesArray[i].filename != filename) {
                        a.push(filesArray[i])
                    }
                }
                // console.log("MODIFIED ARRAY")
                // console.log(a)
                filesArray = a
                console.log("FINAL IS THSI")
                console.log(filesArray)
                Client.updateOne({ username: username }, { files: filesArray }, (err) => {
                    if (err)
                        console.log(err)
                    else
                        console.log("SUCCESSFULLY UPDATED")
                })
            }

        }
    })
    res.redirect("/client/dashboard")

})

router.get("/report/:fileID", isAdminAuth, (req, res) => {
    const filename = req.params.fileID
    // console.log("INSIDE REPORT ROUTER")
    Client.find((err, clients) => {
        if (err)
            console.log(err)
        else {
            // console.log("HEeEEEEEEEEEEEEEEEEEEEEEEEEEEE")
            let flag = 0
            let len = clients.length
            for (let i = 0; i < len; i++) {
                const arr = clients[i].files
                let fileArray = arr.length
                const username = clients[i].username
                // console.log(arr)
                // console.log(fileArray)
                const temparr = []
                for (let j = 0; j < fileArray; j++) {
                    if (arr[j].filename == filename) {
                        // console.log("TO BE REPORTED")
                        // console.log(arr[j])
                        // arr[j].reported = true
                        // console.log("Reporting Done")
                        // console.log(arr[j])
                        const tempfilename = arr[j].filename
                        const tempdate = arr[j].date
                        const temptime = arr[j].time
                        const tempviewfilename = arr[j].viewfilename
                        const tempFilemodel = new File({
                            filename: tempfilename,
                            date: tempdate,
                            time: temptime,
                            viewfilename: tempviewfilename,
                            reported: true
                        })
                        temparr.push(tempFilemodel)

                        flag = 1

                    }
                    else {
                        temparr.push(arr[j])
                    }
                }
                Client.updateOne({ username: username }, { files: temparr }, (err) => {
                    if (err)
                        console.log(err)
                    else
                        console.log("UPDATED THE NEW REPORT")
                })
                // console.log(clients[1])
                if (flag == 1)
                    break
            }
            res.redirect("/client/admin")
        }
    })
})

router.get("/deleteAcc", isAuth, (req, res) => {
    const username = req.user.username
    Client.find({ username: username }, (err, persons) => {
        if (err)
            console.log(err)
        else {
            const a = persons[0]
            const filesarray = a.files
            const len = filesarray.length
            for (let i = 0; i < len; i++) {
                const filename = filesarray[i].filename
                const directory_name = path.join(__dirname, "..", "uploads")
                fs.unlink(directory_name + "/" + filename, (err) => {
                    if (err)
                        console.log(err)
                    else
                        console.log("File Deleted successfully")
                })

            }
            Client.deleteOne({ username: username}, (err)=>{
                if(err)
                    console.log(err)
                else{
                    console.log("USER REMOVED")
                }
            })
            res.redirect("/")
        }
    })
})
router.get("/nodeleteAcc", isAuth, (req, res) => {
    res.redirect("/client/dashboard")
})

// module.exports = router
module.exports.router = router
module.exports.isAuth = isAuth
