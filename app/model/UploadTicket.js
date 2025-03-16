const mongoose = require('mongoose')

const UploadTicket = new mongoose.Schema({
    
    upload : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'drive',
        require : true
        
    },
    del : {
        type : [{type : mongoose.Schema.Types.ObjectId , ref : 'drive'}],
        default : null
    } , 
    dateDue : {
        type : Date,
        default : Date.now()
    },
    status : {
        type : String,
        default : "awaitUpload"
    }

    /*---- end ----*/
}
)

module.exports = mongoose.model('UploadTicket' , UploadTicket)