import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Drive from "../../../model/Drive"
import UploadTicket from "../../../model/UploadTicket"
import User from "../../../model/User"
import schedule from 'node-schedule';
import checkAndDel from "../../../utils/checkAndDel";
import { revalidateTag } from "next/cache";
import { google } from "googleapis";



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

                const servicesAcc = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)

                for (const serviceAcc of servicesAcc){
                    
                    try {
                        const auth = new google.auth.GoogleAuth({
                            credentials: serviceAcc,
                            scopes: ['https://www.googleapis.com/auth/drive'],
                        });

                        // Initialize the Drive API client
                        const drive = google.drive({ version: 'v3', auth });
                        const driveUsed = await drive.about.get({ fields: 'storageQuota' });

                        if (driveUsed && (driveUsed.data.storageQuota.limit - userInfo.driveBuffer) - driveUsed.data.storageQuota.usage - projectReq.size > 0) {
                            return i;  // good use this
                        } 
                    } catch(err){
                        console.error(err + " ; driveUsageCheck/checkStorage");
                        continue;
                    }
                    
                }
            
                return null;  // Default return if nothing matches
            }
            const haveServiceAccFree = await checkStorage();
            console.log(haveServiceAccFree)

            

            //find free acc

            if(haveServiceAccFree !== null){
                return [haveServiceAccFree, null]
            }
            
            //quese auto func 
            //if just newest uploadfirst , overrideable

            //---------------------- find proj to del ---------------------------
            //sort by servicAcc
            let projsArr = [];
            for (let y of projects) {
                if (!y.serviceAcc) continue; // Skip if no serviceAcc defined

                if (projsArr[y.serviceAcc]) {
                    projsArr[y.serviceAcc].push(y);
                } else {
                    projsArr[y.serviceAcc] = [y];
                }
            }

            //filterout permanent and diffrent user and sorted by oldest
            let projsArrSorted = []
            for (let p of projsArr){

                const proFilterPermanent = p.filter((val) => !val.permanent && val.user === projectReq.user);
                const projByOldest =  proFilterPermanent.sort((a, b) => Date.parse(b.timeReqFullfill) - Date.parse(a.timeReqFullfill));
                projsArrSorted.push(projByOldest[0])
            }

            //get oldest global projs 
            let oldestProjService = projsArrSorted.sort((a,b) => Date.parse(b.timeReqFullfill) - Date.parse(a.timeReqFullfill));
            const serviceAccUse = oldestProjService[0].serviceAcc;
            
            if(!oldestProjService){
                return [null , null];
            }

            let delProj = [];
            let sum = 0;

            //determine which proj to del
            for (const curr of projsArr[serviceAccUse]) {
                delProj.push(curr._id);
                sum += curr.size;
                if (projectReq.size < curr.size + sum) break;
            };

            return [serviceAccUse , delProj]
        
        }

        const [serviceAccUse, delProj] = await driveUsageCheck();
        if (serviceAccUse === null) {
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
                const result = checkAndDel(true)
                if(result === "Delt fail"){
                    scheduleFail(i)
                } else {
                    const dateNow = new Date()
                    console.log("Delt successs at " , dateNow) 
                }
            })
            i++
            return i
        }

        schedule.scheduleJob(new Date(obj.dateDue) , ()=> {
            console.log("schedule..")
            const result = checkAndDel(true)
            console.log(result === "Delt fail" ? scheduleFail(0) : "Delt successs at " + new Date())
        })

        revalidateTag("projs")

        return NextResponse.json({ message: "Project request updated successfully" }, { status: 201 });
    } catch (err) {
        console.error("Error in PATCH request:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}