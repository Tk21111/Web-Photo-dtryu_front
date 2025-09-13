import { NextResponse } from "next/server";
import serviceAccSelector from "../../../utils/serviceAccSelector";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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
            tmp = await recursiveFolder(drive , f.id);
            files.push(...tmp);
        }
        

        pageToken = data.nextPageToken;
    } while (pageToken);
    

    return files
   
} 
export async function PATCH(req) {

    function extractTagsFromName(name){
        const matches = name.match(/\[([^\]]+)\]/g) || [];
        return matches.map(tag => tag.replace(/\[|\]/g, ""));
    }

    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json({"msg" : "no permission"} , {status : 403})
        }

        const { driveFolder, tags , together} = await req.json();

        if (!driveFolder || !tags || !Array.isArray(tags)) {
            return NextResponse.json({ msg: "bad req" }, { status: 400 });
        }

        const drive = serviceAccSelector(0);
        const allFolderIds = await recursiveFolder(drive , driveFolder)
        allFolderIds.push(driveFolder)

        let recomm = {}
        let allFiles = []

        if (!together){
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
                        for (const val of data.files) {
                            if (val.name.includes(`[${tag}]`) && !allFiles.some(f => f.id === val.id)) {
                            allFiles.push(val);
                            }
                        }
                    }


                    pageToken = data.nextPageToken;
                } while (pageToken);
            }
        } else if (tags.length > 1){
            let pageToken = null;

            do {
                // Search in all folders at once
                const folderQueries = allFolderIds.map(folderId => `'${folderId}' in parents`);
                const folderQuery = `(${folderQueries.join(' or ')})`;
                const tagFormatted = tags.map(tag => `name contains '[${tag}]'`);
                const tagstr = `(${tagFormatted.join(" and ")})`
                
                const { data } = await drive.files.list({
                    q: `${tagstr} and ${folderQuery} and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
                    fields: "nextPageToken, files(id, name, mimeType, parents)",
                    pageSize: 1000,
                    pageToken: pageToken || undefined,
                    supportsAllDrives: true
                });

                if (data.files?.length) {
                    for (const val of data.files) {
                        if ( tags.some(tag => val.name.includes(`[${tag}]`)) && !allFiles.some(f => f.id === val.id)) {
                            allFiles.push(val);
                        }
                    }
                }


                pageToken = data.nextPageToken;
            } while (pageToken);

            pageToken = null;

            const tmpallFiles = []
            if( !allFiles || allFiles.length === 0){
                do {
                // Search in all folders at once
                const folderQueries = allFolderIds.map(folderId => `'${folderId}' in parents`);
                const folderQuery = `(${folderQueries.join(' or ')})`;
                const tagFormatted = tags.map(tag => `name contains '[${tag}]'`);
                const tagstr = `(${tagFormatted.join(" or ")})`
                
                const { data } = await drive.files.list({
                    q: `${tagstr} and ${folderQuery} and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
                    fields: "nextPageToken, files(id, name, mimeType, parents)",
                    pageSize: 1000,
                    pageToken: pageToken || undefined,
                    supportsAllDrives: true
                });

                if (data.files?.length) {
                    for (const val of data.files) {
                        if (!tmpallFiles.some(f => f.id === val.id)) {
                            tmpallFiles.push(val);
                        }
                    }
                }


                pageToken = data.nextPageToken;
            } while (pageToken);
            
            const tagCounts = {};

            if(tmpallFiles.length === 0){
                return NextResponse.json({msg : "not found"},{status : 404})
            }

            for (const file of tmpallFiles) {
                
                if (!file.name){
                    continue;
                }
                
                const fileTags = extractTagsFromName(file.name);

                    for (const tag of tags){
                        if(fileTags.includes(tag)){
                            if (!tagCounts[tag]){
                                tagCounts[tag] = {}
                            }
                            for (const t of fileTags) {
                                if (!tags.includes(t)) {
                                    tagCounts[tag][t] = (tagCounts[tag][t] || 0) + 1;
                                }
                            }

                        }
                    }
                    
            }

            for (const [tag , value] of  Object.entries(tagCounts)){
                 const recommendations = Object.entries(value)
                .sort((a, b) => b[1] - a[1]) // sort by frequency
                .map(([tag]) => tag);
                recomm[tag] = recommendations;
                
            }
            }
        }
         if( recomm && Object.keys(recomm) > 0)
        {
            return NextResponse.json({recomm} , { status : 404})
        } else if( !allFiles || allFiles.length === 0)
        {
            return NextResponse.json({"msg" : "not found"} , { status : 404})
        }

        return NextResponse.json(allFiles);
    } catch (err) {
        console.error("Error in PATCH request:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
