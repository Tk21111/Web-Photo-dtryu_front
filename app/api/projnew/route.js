import { NextResponse } from "next/server";
import { connectToNewDatabase } from "../../lib/newmongodb";
import newProj from "../../model/newProj";

export async function GET() {
  try {

    await connectToNewDatabase();

    console.log("hellow bitvh")
    // Fetch all documents as an array
    const data = await newProj.find({})

    if (!data || data.length === 0) {
      return NextResponse.json({ msg: "none found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
