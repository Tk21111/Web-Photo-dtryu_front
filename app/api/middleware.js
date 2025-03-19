// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

export function middleware(req){
    // Apply middleware only to /api/proj route
    console.log("middleware")
    if (req.nextUrl.pathname.startsWith('/api')) {
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new NextResponse(
                JSON.stringify({ message: 'Authorization header is missing or malformed' }),
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verify the JWT
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

            if (!decoded.userinfo) {
                return new NextResponse(
                    JSON.stringify({ message: 'Token does not contain valid userinfo' }),
                    { status: 403 }
                );
            }

            // Attach userinfo to request
            const headers = new Headers(req.headers);
            headers.set('x-custom-header', `${decoded.userinfo.username},${decoded.userinfo.roles}`);

            const resp = NextResponse.next({
                // New option `request.headers` which accepts a Headers object
                // overrides request headers with the specified new ones.
                request: {
                    headers
                }
            });
            resp.headers.set('x-hello-client', 'bar');
            console.log("hello");
            console.log(resp.headers);
            return resp;
        } catch (err) {
            return new NextResponse(
                JSON.stringify({ message: `Invalid token: ${err.message}` }),
                { status: 403 }
            );
        }
    }

    // If the route doesn't match /api/proj, continue without modification
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/*'],  // Apply middleware only to routes under /api/proj
};
