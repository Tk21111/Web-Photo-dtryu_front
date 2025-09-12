Bytes = MB × 1,048,576
Bytes = GB × 1,073,741,824

priority => low = 0 high = 9
status = { null : createProj. , pre-upload : send req for upload wait for upload , uploading : accept req, onDrive , reqed : waiting for upload}\

enum : ["resting" , "pre-upload" , "uploading" , "onDrive" , "upload failing" , delting , "delt fail"]
enum : ["await" , "awaitDelt" , "awaitUpload" , "delting" , "uploading" , "upload fail" , "delt fail"]

await User.findByIdAndUpdate(userInfo._id, {
    $push: { uploadQueue: obj }
});
interseting use for later# dtryu
# dtryu

{
  storageQuota: {
    limit: '16106127360',
    usage: '653226',
    usageInDrive: '653226',
    usageInDriveTrash: '0'
  }
}


priorty
fail pr
update
multicore