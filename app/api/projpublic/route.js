import { NextResponse } from "next/server";
import Drive from "../../model/Drive";
import { connectToDatabase } from "../../lib/mongodb";

export async function GET(req) {

    try {
         await connectToDatabase();

        let projs = [];
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            // Find one by id
            projs = await Drive.find({ _id: id });
        } else {
            // Get all documents
            projs = await Drive.find();
        }
        return NextResponse.json(projs);

    } catch(err){
        console.error("get proj : " + err)
        return NextResponse.json({"err" : err},{status : 500});
    }
 

}
