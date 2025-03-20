import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
    const res = NextResponse.next();
    
    console.log("Middleware triggered");

    if (req.nextUrl.pathname.startsWith("/api")) {
        const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse(
                JSON.stringify({ message: "Authorization header is missing or malformed" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log("Authorization Header:", authHeader);
        const token = authHeader.split(" ")[1];
        console.log(token)
        console.log(process.env.ACCESS_TOKEN)

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN );

            if (!decoded?.userinfo) {
                return new NextResponse(
                    JSON.stringify({ message: "Token missing user info" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            console.log("JWT Decoded:", decoded);

            // Set user information in headers
            res.headers.set("user", decoded.userinfo.username);
            res.headers.set("roles", JSON.stringify(decoded.userinfo.roles)); // Fix duplicate "user" header

        } catch (err) {
            console.log(err)
            return new NextResponse(
                JSON.stringify({ message: "Invalid token srhj" }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }
    }

    return res;
}

export const config = {
    matcher: ["/api/projs/:path*"], // Fix matcher syntax to apply to all subpaths under /api
};
