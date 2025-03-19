import { connectToDatabase } from "../../../lib/mongodb";
import Drive from "../../../model/Drive";
import UploadTicket from "../../../model/UploadTicket";
import { NextResponse } from "next/server";

export async function PATCH(req) {

    await connectToDatabase();
    try {
        const { projId, uploadTicketId, locationOnDrive } = await req.json(); // Ensure request body is parsed

        if (!projId || !uploadTicketId || !locationOnDrive) {
            return NextResponse.json({ status: 400, message: "Missing required fields" });
        }

        await UploadTicket.findByIdAndDelete(uploadTicketId);

        const proj = await Drive.findByIdAndUpdate(
            projId,
            { status: "onDrive", locationOnDrive, timeReqFullfill: Date.now() },
            { new: true } // Ensures the updated document is returned
        );

        if (!proj) return NextResponse.json({ status: 404, message: "Project not found" });

        return NextResponse.json({ status: 200, message: "Upload completed successfully" });
    } catch (err) {
        console.error(err, " ; finishUpload");
        return NextResponse.json({ status: 500, error: err.message });
    }
}
