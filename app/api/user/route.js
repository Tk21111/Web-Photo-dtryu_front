import User from "../../model/User";
import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectToDatabase();

    // Parse JSON request body
    const { user, pwd } = await req.json();
    if (!user || !pwd) return NextResponse.json({ status: 400 });

    const found = await User.findOne({ username: user }).exec();
    if (!found) return NextResponse.json({ status: 401 });

    const match = await bcrypt.compare(pwd, found.password);
    if (match) {
        const roles = found.roles;

        const accessToken = jwt.sign(
            { userinfo: { username: found.username, roles } },
            process.env.ACCESS_TOKEN,
            { expiresIn: "30d" }
        );

        const refreshToken = jwt.sign(
            { username: found.username },
            process.env.REFRESH_TOKEN,
            { expiresIn: "365d" }
        );

        return NextResponse.json({
            accessToken,
            refreshToken,
            image: found?.image || null,
            aka: found?.aka || null,
            userId: found._id,
            score: found.score || 0,
            roles : found.roles || null
        });
    } else {
        return NextResponse.json({ status: 401 });
    }
}

export async function PATCH(req) {
    await connectToDatabase();

    const { refreshToken } = await req.json();
    console.log(refreshToken);

    if (!refreshToken) return NextResponse.json({ status: 403 });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        const found = await User.findOne({ username: decoded.username }).exec();

        if (!found) return NextResponse.json({ status: 401 });

        const accessToken = jwt.sign(
            { userinfo: { username: found.username, roles: found.roles } },
            process.env.ACCESS_TOKEN,
            { expiresIn: "1d" }
        );

        return NextResponse.json({
            accessToken,
            image: found?.image || null,
            aka: found?.aka || null,
            userId: found._id,
            score: found.score || 0,
            roles : found.roles || null
        });
    } catch (err) {
        console.error(err + " ; refresh");
        return NextResponse.json({ status: 403 });
    }
}

export async function GET(req) {
    await connectToDatabase();
    
    const cookie = req.cookies;
    if (!cookie?.jwt) return NextResponse.json({ status: 204 });

    const refreshToken = cookie.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        return NextResponse.json({ status: 204 });
    }

    return NextResponse.json({ status: 204 });
}
