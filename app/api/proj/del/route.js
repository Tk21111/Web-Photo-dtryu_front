import Drive from "../../../model/Drive";
import UploadTicket from "../../../model/UploadTicket";
import { NextResponse } from "next/server";
import checkAndDel from "../../../utils/checkAndDel";
import { connectToDatabase } from "../../../lib/mongodb";
import { serviceAccSelector } from "../../../utils/serviceAccSelector";



export async function PATCH(req) {

    await connectToDatabase();
    try {
        const { projId, uploadTicketId, locationOnDrive } = await req.json();

        if (!projId || !locationOnDrive || !uploadTicketId) {
            return NextResponse.json({ status: 400, message: "Missing required fields" });
        }

        await UploadTicket.findByIdAndDelete(uploadTicketId);

        const proj = await Drive.findByIdAndUpdate(projId, { 
            status: "onDrive", 
            locationOnDrive 
        });

        if (!proj) return NextResponse.json({ status: 404, message: "Project not found" });

        await checkAndDel();

        return NextResponse.json({ status: 200, message: "Delting" });
    } catch (err) {
        console.error(err, " ; finishUpload");
        return NextResponse.json({ status: 500, error: err.message });
    }
}
