import mongoose from "mongoose";

const driveShema = new mongoose.Schema({
    
    name : {
        type : String,
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    originalTime : {
        type : Date,
        require : true
    },
    /*for on drive*/
    status : {
        type : String,
        enum : ["resting" , "pre-upload" , "uploading" , "onDrive" , "failing"],
        default : "resting"
    },
    /*---- end ----*/
    locationOnDisk : {
        type : String,
        require : true
    },
    locationOnDrive : {
        type : String,
        default : null
    },
    size : {
        type : Number
    },
    /* for the reqed but not upload */
    timeUpdateReq : {
        type : Date
    },
    /*priority*/
    timeReqFullfill : {
        type : Date,
        default : Date.now()
    },
    priority : {
        type : Number,
        default : 0.0 // 0-9
    },
    public : {
        type : Boolean,
        default : true
    },
    serviceAcc : {
        type : Number,
        default : 0
    },
    file : {
        type : [String],
        default : []
    }
    /*---- end ----*/
},{
    timestamps : true
}
)

const out = mongoose.models.drive || mongoose.model('drive' , driveShema)
export default out;