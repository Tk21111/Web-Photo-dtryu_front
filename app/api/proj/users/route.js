import Drive from "../../../model/Drive";
import UploadTicket from "../../../model/UploadTicket";
import checkAndDel from "../../../utils/checkAndDel";

//fail
//@uploadFail
export async function PATCH(req) {

    try {
        const {projId , uploadTicketId} = req.body;
        if(!projId || !uploadTicketId) return Response.json({status : 400})

        const proj = await Drive.findByIdAndUpdate(projId , {status : "upload fail"});
        const uploadTicket = await UploadTicket.findByIdAndUpdate(uploadTicketId , {status : "upload fail" , del : projId});
        if(!proj || !uploadTicket) return Response.json({status : 404});

        checkAndDel()

        return Response.json({status : 200}); 
    } catch (err) {
        console.log("uploadFail ;" , err);
        return Response.json(err)
    }
}

//get upload req
//@uploadticket GET
export async function GET() {
    try {
       
        const uploadReq = await UploadTicket.find({ del: null , status : "awaitUpload"}).populate("upload");   
        
        return Response.json(uploadReq)
    } catch (err){
        console.log(err + " ; getUploadReq");
        return Response.json(err)
    }
}