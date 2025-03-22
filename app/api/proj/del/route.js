
import UploadTicket from "../../../model/UploadTicket";
import { NextResponse } from "next/server";
import checkAndDel from "../../../utils/checkAndDel";
import { connectToDatabase } from "../../../lib/mongodb";
import { revalidatePath } from "next/cache";



export async function PATCH(req) {

    await connectToDatabase();
    try {
            const {projId} = await req.json();
    
             await UploadTicket.create({
                upload : null,
                del : [projId],
                dateDue : Date.now(),
                status : "awaitDelt"
            });
    
            await checkAndDel();

            revalidatePath('/projs')
            return NextResponse.json({ status : 201});

            
        } catch (err) {
            console.log(err + " ; delProj")
            return NextResponse.json(err)
        }
}
