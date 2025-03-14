import mongoose from "mongoose"

const UploadTicket = new mongoose.Schema({
    
    upload : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'drive',
        require : true
        
    },
    del : {
        type : Array,
        default : null
    } , 
    dateDue : {
        type : Date,
        default : Date.now()
    },
    status : {
        type : String,
        default : "awiat"
    }

    /*---- end ----*/
}
)

export default mongoose.models.UploadTicket || mongoose.model('UploadTicket' , UploadTicket)