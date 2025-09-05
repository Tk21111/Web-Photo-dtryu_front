import { NextResponse } from "next/server";
import UploadTicket from "../../../model/UploadTicket";
import Drive from "../../../model/Drive";
import { connectToDatabase } from "@/app/lib/mongodb";
import checkAndDel from "../../../utils/checkAndDel";

//update proj
export async function PATCH(req){

    await connectToDatabase();

    try {

        const { projId } = await req.json()

        // const dup = await UploadTicket.findOne({upload : projId})

        // if(dup) return NextResponse.json({status : 201})

        await Drive.findByIdAndUpdate(projId , {
            status : "updating"
        })
            
        await UploadTicket.create({
            upload : projId,
            dateDue : Date.now(),
            status : "update",
            del : projId
        })

        await checkAndDel(false);

        return NextResponse.json({status : 200});


    } catch (err){

        console.log("update proj : " + err)
        return NextResponse.json(err)
    }
}

export async function POST(req){

    await connectToDatabase();

    try {

        const { projId } = await req.json()

        const proj = await Drive.findById(projId)
        
        if(proj.lock){
            //release
            proj.lock = false;
        } else if(!proj.lock && !proj.group && proj.public ) {
            //public
            proj.public = false;
        } else if(!proj.lock){
            //have group
            proj.lock = true;
        }

        await proj.save();

        return NextResponse.json({status : 200});


    } catch (err){

        console.log("update proj : " + err)
        return NextResponse.json(err)
    }
}