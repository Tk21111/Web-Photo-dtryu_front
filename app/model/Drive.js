import mongoose from "mongoose"

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
    }
    /*---- end ----*/
},{
    timestamps : true
}
)

export default mongoose.models.drive || mongoose.model('drive' , driveShema)