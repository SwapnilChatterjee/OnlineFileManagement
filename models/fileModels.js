const mongoose = require('mongoose')


const fileSchema = new mongoose.Schema({
    filename:{
        type: String,
         required: [true, "ENTER PROPER FILENAME"]
    },
    date:{
        type: String,
        required: [true, "ENTER DATE OF UPLOAD"]
    },
    time:{
        type: String,
        required: [true, "ENTER TIME OF UPLOAD"]
    },
    viewfilename:{
        type: String
    },
    reported:{
        type:Boolean
    }
})

const File = mongoose.model("fileupload", fileSchema)

module.exports = File
