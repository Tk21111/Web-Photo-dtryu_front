import { NextResponse } from "next/server";
import Drive from "../../model/Drive"
import { connectToDatabase } from "../../lib/mongodb";
import { headers } from "next/headers";

export async function GET() {
    await connectToDatabase();
    const projs = await Drive.find();
    const headersList = await headers()

    console.log(headersList.get('x-forwarded-for'))

    return NextResponse.json(projs);
}