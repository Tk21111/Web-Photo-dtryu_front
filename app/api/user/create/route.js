import User from "../../../model/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function POST(req) {
    
    await connectToDatabase();
    try {
        const { user, pwd, name, age, sex } = await req.json();
        if (!user || !pwd) return NextResponse.json({ status: 400 });

        const duplicate = await User.findOne({ username: user }).lean().exec();
        if (duplicate) return NextResponse.json({ status: 409 }); // Conflict

        const hashpwd = await bcrypt.hash(pwd, 10);

        await User.create({
            username: user,
            password: hashpwd,
        });

        return NextResponse.json({ status: 200 });
    } catch (err) {
        console.error("Error creating user:", err);
        return NextResponse.json({ status: 500, error: err.message });
    }
}
