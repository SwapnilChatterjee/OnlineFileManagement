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

const clientschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Check the data entry not specified!!"]
    },
    username : {
        type: String,
        required: [true, "Please Check the data entry not specified!!"],
        
    },
    pass:{
        type: String,
        required: [true, "PASSWORD MISSING--------"]
    },
    files:[{
        type: fileSchema
    }],
    admin: {
        type: Boolean
    }

    
    
})

const Client = mongoose.model("client", clientschema)

module.exports = Client