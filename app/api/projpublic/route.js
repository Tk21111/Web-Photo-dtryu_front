import { NextResponse } from "next/server";
import Drive from "../../model/Drive"
import { connectToDatabase } from "../../lib/mongodb";

export async function GET() {
    await connectToDatabase();
    const projs = await Drive.find();
    

    return NextResponse.json(projs);
}