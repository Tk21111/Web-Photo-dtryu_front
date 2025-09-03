import { NextResponse } from "next/server";
import serviceAccSelector from "../../../utils/serviceAccSelector";

export async function PATCH(req) {
    try {
        const { driveFolder, tags } = await req.json();
        if (!driveFolder || !tags || !Array.isArray(tags)) {
            return NextResponse.json({ msg: "bad req" }, { status: 400 });
        }

        const drive = serviceAccSelector(0);
        let out = [];

        for (const tag of tags) {
            let pageToken = null;

            do {
            const { data } = await drive.files.list({
                q: `name contains '[${tag}]' and '${driveFolder}' in parents`,
                fields: "nextPageToken, files(id, name, mimeType)",
                pageSize: 100,
                pageToken: pageToken || undefined
            });

            if (data.files?.length) {
                out.push(...data.files);
            }

            pageToken = data.nextPageToken;
            } while (pageToken);
        }

        return NextResponse.json(out);
    } catch (err) {
        console.error("Error in PATCH request:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
