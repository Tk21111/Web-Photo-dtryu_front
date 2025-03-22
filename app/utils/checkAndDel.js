import Drive from "../model/Drive";
import UploadTicket from "../model/UploadTicket";
import serviceAccSelector from "./serviceAccSelector";

async function checkAndDel() {
    try {
        // Find all upload tickets that match the status
        const now = Date.now();
        const req = await UploadTicket.find({
            $or: [{ status: 'awaitDelt' }, { status: 'upload fail' } , {status : 'delt fail'}]
        }).populate('del');   

        // Delete upload tickets with `del: null` and `upload: null`
        await UploadTicket.deleteMany({ del: null, upload: null });

        // Filter expired tickets where `del` is not null
        const folder = req.filter(val => val.dateDue <= now && val.del !== null);

        async function delInGgDrive(parentProjFolder, serviceAcc) {
            if (!serviceAcc) {
                console.error("Service account is undefined!");
                return "Delt fail"; // Added return here
            }

            const drive = serviceAcc;
            try {
                const { data } = await drive.files.list({
                    q: `'${parentProjFolder}' in parents`,
                    fields: 'files(id, name, mimeType)',
                });

                if (data.files && data.files.length > 0) {
                    for (const children of data.files) {
                        if (children.mimeType === 'application/vnd.google-apps.folder') {
                            await delInGgDrive(children.id, serviceAcc);
                            console.log("Deleted folder: " + children.name);
                        } else {
                            await drive.files.delete({ fileId: children.id });
                            console.log("Deleted file: " + children.name);
                        }
                    }
                }

                // Delete the parent folder after all contents are deleted
                await drive.files.delete({ fileId: parentProjFolder });
                console.log("Deleted parent folder: " + parentProjFolder);

            } catch (err) {
                console.error("Error deleting from Google Drive: ", err);
                return "Delt fail"; // Added return here
            }
        }

        if (folder.length > 0) {
            for (let uploadTicket of folder) {
                for (let proj of uploadTicket.del) {
                    try {
                        await Drive.findByIdAndUpdate(proj._id, { status: "deleting" }, { new: true });
                        await UploadTicket.findByIdAndUpdate(uploadTicket._id, { status: "deleting" }, { new: true });
                    } catch (err) {
                        await Drive.findByIdAndUpdate(proj._id, { status: "delt fail" });
                        await UploadTicket.findByIdAndUpdate(uploadTicket._id, { status: "delt fail" });
                        console.error("Error updating UploadTicket to deleting:", err);
                        return "Delt fail"; // Added return here
                    }

                    console.log("Deleting project:", proj);
                    const parentFolder = proj.locationOnDrive;

                    if (!parentFolder) {
                        console.warn("No parent folder found for project:", proj._id);
                        continue; // Skip this project
                    }

                    try {
                        const serviceAcc = serviceAccSelector(proj.serviceAcc);
                        if (!serviceAcc) {
                            console.error("Service account missing for project:", proj._id);
                            continue;
                        }

                        await delInGgDrive(parentFolder, serviceAcc);
                        console.log("Deleted project folder successfully");
                    } catch (err) {
                        await Drive.findByIdAndUpdate(proj._id, { status: "delt fail" });
                        await UploadTicket.findByIdAndUpdate(uploadTicket._id, { status: "delt fail" });
                        console.error("Error deleting project folder:", err);
                        return "Delt fail"; // Added return here
                    }

                    // Update project status to "resting"
                    try {
                        await Drive.findByIdAndUpdate(proj._id, { status: "resting", locationOnDrive: null }, { new: true });
                    } catch (err) {
                        await Drive.findByIdAndUpdate(proj._id, { status: "delt fail" });
                        await UploadTicket.findByIdAndUpdate(uploadTicket._id, { status: "delt fail" });
                        console.error("Error updating project status:", err);
                        return "Delt fail"; // Added return here
                    }
                }

                // Update UploadTicket `del` to null after deletion
                try {
                    await UploadTicket.findByIdAndUpdate(uploadTicket._id, { del: null, status: "awaitUpload" }, { new: true });
                } catch (err) {
                    await Drive.findByIdAndUpdate(proj._id, { status: "delt fail" });
                    await UploadTicket.findByIdAndUpdate(uploadTicket._id, { status: "delt fail" });
                    console.error("Error updating UploadTicket:", err);
                    return "Delt fail"; // Added return here
                }
            }
        }

        return "success";

    } catch (err) {
        console.error("Error in checkAndDel function:", err);
        return "Delt fail"; // Added return here
    }
}

export default checkAndDel;
