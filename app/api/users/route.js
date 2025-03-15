import { connectToDatabase } from "../../lib/mongodb";
import UploadTicket from "../../model/UploadTicket";
import Drive from "../../model/Drive";

export async function GET() {

    await connectToDatabase();
    const projs = await Drive.find({public : true});
        
    return Response.json(projs)
    
}