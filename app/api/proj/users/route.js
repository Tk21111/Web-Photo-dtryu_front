import Drive from "../../../model/Drive";
import User from "../../../model/User";
import UploadTicket from "../../../model/UploadTicket";
import checkAndDel from "../../../utils/checkAndDel";

import { connectToDatabase } from "@/app/lib/mongodb";

//fail
//@uploadFail
export async function PATCH(req) {
    
    await connectToDatabase();

    try {
        const {projId , uploadTicketId} = req.body;
        if(!projId || !uploadTicketId) return Response.json({status : 400})

        const proj = await Drive.findByIdAndUpdate(projId , {status : "upload fail"});
        const uploadTicket = await UploadTicket.findByIdAndUpdate(uploadTicketId , {status : "upload fail" , del : projId});
        if(!proj || !uploadTicket) return Response.json({status : 404});

        checkAndDel(true)

        return Response.json({status : 200}); 
    } catch (err) {
        console.log("uploadFail ;" , err);
        return Response.json(err)
    }
}

//get upload req
//@uploadticket GET
export async function POST(req) {

        
    await connectToDatabase();

    try {
       
        const { user } = await req.json();
        let uploadReq = await UploadTicket.find({ del: null ,  upload: { $ne: null } , $or : [ {status : "awaitUpload"} , {status : "update"}]}).populate("upload");
        const userData = await User.findOne({username : user }).exec();
        
        uploadReq = uploadReq.filter(ticket => {
            return ticket.upload.user && ticket.upload.user.equals(userData._id);
        });



        
        return Response.json(uploadReq)
    } catch (err){
        console.log(err + " ; getUploadReq");
        return Response.json(err)
    }
}