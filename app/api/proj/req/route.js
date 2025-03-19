import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Drive from "../../../model/Drive";
import UploadTicket from "../../../model/UploadTicket"
import serviceAccSelector from "../../../utils/serviceAccSelector";
import User from "../../../model/User"
import schedule from 'node-schedule';
import checkAndDel from "../../../utils/checkAndDel";

export async function PATCH(req) {
    await connectToDatabase();

    try {
        const { projId } = await req.json();
        if (!projId) return NextResponse.json({ error: "Missing projId" }, { status: 400 });

        const projectReq = await Drive.findById(projId);
        if (!projectReq) return NextResponse.json({ error: "Project not found" }, { status: 404 });
        if (["uploading", "onDrive", "pre-upload"].includes(projectReq.status)) {
            return NextResponse.json({ message: "Project is already processing" }, { status: 208 });
        }

        const projects = await Drive.find({ user: projectReq.user });
        const userInfo = await User.findById(projectReq.user);
        if (!userInfo) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        const driveUsageCheck = async () => {
            async function checkStorage() {
                const serviceAccounts = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "[]");
                for (const account of serviceAccounts) {
                    try {
                        const drive = serviceAccSelector(account);
                        const driveUsed = await drive.about.get({ fields: "storageQuota" });
                        if (
                            driveUsed &&
                            (driveUsed.data.storageQuota.limit - userInfo.driveBuffer) -
                            driveUsed.data.storageQuota.usage - projectReq.size > 0
                        ) {
                            return account;
                        }
                    } catch (err) {
                        console.error("Error in driveUsageCheck:", err);
                    }
                }
                return null;
            }

            const haveServiceAccFree = await checkStorage();
            if (haveServiceAccFree) return [haveServiceAccFree, null];

            const projsArr = {};
            for (const y of projects) {
                if (!projsArr[y.serviceAcc]) projsArr[y.serviceAcc] = [];
                projsArr[y.serviceAcc].push(y);
            }

            let projsArrSorted = [];
            for (const p in projsArr) {
                const projByOldest = projsArr[p].sort((a, b) => Date.parse(a.timeReqFullfill) - Date.parse(b.timeReqFullfill));
                projsArrSorted.push(projByOldest[0]);
            }

            const oldestProjService = projsArrSorted.sort((a, b) => Date.parse(a.timeReqFullfill) - Date.parse(b.timeReqFullfill));
            if (!oldestProjService.length) return [null, null];

            let delProj = [], sum = 0;
            const serviceAccUse = oldestProjService[0].serviceAcc;
            for (const curr of projsArr[serviceAccUse]) {
                delProj.push(curr._id);
                sum += curr.size;
                if (sum >= projectReq.size) break;
            }

            return [serviceAccUse, delProj];
        };

        const [serviceAccUse, delProj] = await driveUsageCheck();
        if (!serviceAccUse) {
            return NextResponse.json({ error: "No available Google Drive storage" }, { status: 500 });
        }

        const obj = {
            upload: projectReq._id,
            del: delProj || null,
            dateDue: Date.now() + (delProj ? 3 * 24 * 60 * 60 * 1000 : 0),
            status: delProj ? "awaitDelt" : "awaitUpload"
        };

        if (projectReq.priority >= 9) {
            if (userInfo.autoQueue) {
                await UploadTicket.create(obj);
            } else {
                console.log("Future path trigger: Hdrive req proj priority");
            }
        } else if (userInfo.autoQueue) {
            userInfo.uploadQueue.push(obj);
            await userInfo.save();
        }

        projectReq.serviceAcc = serviceAccUse;
        projectReq.status = "pre-upload";
        projectReq.timeUpdateReq = Date.now();
        await projectReq.save();

        function scheduleFail(i) {

            schedule.scheduleJob(new Date(Date.now() + 1000*60*60*15) , () => { 
                console.log("schedule... : " , i , " ")
                const result = checkAndDel()
                if(result === "Delt fail"){
                    scheduleFail(i)
                } else {
                    "Delt successs at " + new Date()
                }
            })
            i++
            return i
        }

        schedule.scheduleJob(new Date(obj.dateDue) , ()=> {
            console.log("schedule..")
            const result = checkAndDel()
            console.log(result === "Delt fail" ? scheduleFail(0) : "Delt successs at " + new Date())
        })

        return NextResponse.json({ message: "Project request updated successfully" }, { status: 201 });
    } catch (err) {
        console.error("Error in PATCH request:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}