import { NextResponse } from "next/server";
import serviceAccSelector from "../../../utils/serviceAccSelector";

//q: `name contains '[${tag}]' and '${driveFolder}' in parents and trashed=false`,
async function recursiveFolder(drive , driveFolder )
{
    let files = [];
    let pageToken = null;
        do {
        const { data } = await drive.files.list({
            q: ` mimeType='application/vnd.google-apps.folder' and '${driveFolder}' in parents and trashed=false`,
            fields: "nextPageToken, files(id, name, mimeType)",
            pageSize: 1000, // Increased from 100
            pageToken: pageToken || undefined,
            supportsAllDrives: true // Add if using shared drives
        });

        if( data.files.length === 0){
            continue;
        }
        for (const f of data.files){
            files.push(f.id);
            tmp = await recursiveFolder(drive , f);
            files.push(...tmp);
        }
        

        pageToken = data.nextPageToken;
    } while (pageToken);
    

    return files
   
} 
export async function PATCH(req) {
    try {
        const { driveFolder, tags } = await req.json();

        console.log(tags)
        if (!driveFolder || !tags || !Array.isArray(tags)) {
            return NextResponse.json({ msg: "bad req" }, { status: 400 });
        }

        const drive = serviceAccSelector(0);
        const allFolderIds = await recursiveFolder(drive , driveFolder)
        allFolderIds.push(driveFolder)

        let allFiles = []

        for (const tag of tags) {
            let pageToken = null;

            do {
                // Search in all folders at once
                const folderQueries = allFolderIds.map(folderId => `'${folderId}' in parents`);
                const folderQuery = `(${folderQueries.join(' or ')})`;
                
                const { data } = await drive.files.list({
                    q: `name contains '[${tag}]' and ${folderQuery} and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
                    fields: "nextPageToken, files(id, name, mimeType, parents)",
                    pageSize: 1000,
                    pageToken: pageToken || undefined,
                    supportsAllDrives: true
                });

                if (data.files?.length) {

                    allFiles.push(...data.files.filter(val=> val.name.includes(`[${tag}]`)));
                }

                pageToken = data.nextPageToken;
            } while (pageToken);
        }

        if( !allFiles || allFiles.length === 0)
        {
            return NextResponse.json({"msg" : "not found"} , { status : 404})
        }

        return NextResponse.json(allFiles);
    } catch (err) {
        console.error("Error in PATCH request:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
