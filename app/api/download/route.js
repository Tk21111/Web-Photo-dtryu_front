import { NextResponse } from "next/server";

export async function GET(request) {
  // 1. Get ID from query params (e.g., /api/download?id=123)
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing ID parameter", { status: 400 });
  }

  const url = `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}`;

  try {
    const upstreamResponse = await fetch(url);

    if (!upstreamResponse.ok) {
      return new NextResponse("Failed to fetch image from server", {
        status: upstreamResponse.status,
      });
    }

    // 2. Prepare headers
    const headers = new Headers();
    // Force download
    headers.set("Content-Disposition", `attachment; filename="${id}.jpg"`);
    // Pass the content type (e.g., image/jpeg) from the image server
    headers.set("Content-Type", upstreamResponse.headers.get("Content-Type") || "application/octet-stream");
    // Pass content length if available
    const contentLength = upstreamResponse.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);

    // 3. Return the stream directly (Efficient!)
    // We pass upstreamResponse.body directly to NextResponse
    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers: headers,
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}