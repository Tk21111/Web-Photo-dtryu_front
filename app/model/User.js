import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    roles: {
        type : [String],
        default : ["User"]
    },
    driveBuffer : {
        type : Number,
        default : 524288000
    },
    driveSize : {
        type : Number,
        default : 16105472360
    },
    uploadQueue : {
        type : Array,
        default : []
    },
    autoQueue  :{
        type : String,
        default : "true"
    }

})

export default mongoose.models.User || mongoose.model('User' , userSchema)