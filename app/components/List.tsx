"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectRoles, selectUserId } from "../api/redux/authSlice";
import serviceAccConverter from "../utils/serviceAccConvertong";
import Image, { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";

type Proj = {
  _id: string;
  name: string;
  user: string;
  status: string;
  locationOnDisk: string;
  locationOnDrive: string;
  size: number;
  timeReqFullfill: string;
  originalTime :string;
  serviceAcc : number;
  group : string | undefined;
  lock : boolean | undefined;
};

export default function List({ proj }: { proj: Proj }) {
  const [isOpen, setIsOpen] = useState(false); // Default closed state
  const [click , setClick] = useState(false);
  const [reqFail ,setreqFail]= useState(false);
  const [service, setService] = useState<(string | StaticImageData)[]>();
  const accessToken = useSelector(selectCurrentToken);
  const roles = useSelector(selectRoles);
  const userId = useSelector(selectUserId)

  const path = usePathname()

  const [copy , setCopy] = useState<boolean>(false);
  const handleSubmit = async (e: React.MouseEvent) => {

    e.stopPropagation();
    e.preventDefault();

    if (!proj._id || !["pre-upload", "resting"].includes(proj.status) || click) return;


    setClick(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic/req`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projId: proj._id }),
      });

      if (!res.ok) {
        setClick(false);
        setreqFail(true);
        throw new Error(`reqFd to request: ${res.statusText}`);
      }

      

      console.log("Request successful:", await res.json());
    } catch (err) {
      setClick(false);
      setreqFail(true);
      console.error("Error in request:", err);
    }
  };

  const handleDelProjDrive = async (e : React.MouseEvent) => {

    e.stopPropagation()
    e.preventDefault();

    if(!proj._id) return null
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/proj/del` ,{
        method : "PATCH",
        body : JSON.stringify({projId : proj._id}),
        headers : {
          "Content-Type": "application/json",
          authorization : `Bearer ${accessToken}`
        },
        cache : 'reload'
      })

      const resMsg = await res.json();
      console.log(resMsg); 
      } catch (err) {
        console.error("Error in request:", err);
      }
  }

  useEffect(() => {
    setService(serviceAccConverter(proj.serviceAcc))
    if(proj.status === "uploading"){
      setClick(true)
    } else if (proj.status === "upload fail"){
      setreqFail(true)
    }
  },[proj])



  return (
    <div className={`w-full h-fit pl-2 py-1 border-2 rounded-2xl shadow-2xl bg-accent-content transition-all duration-500 ease-in-out
      ${isOpen && "h-full"}
      ${proj.status === "uploading" || click ? "bg-orange-300 text-orange-800 animate-pulse" : ""}
      ${proj.status === "onDrive" ? " text-white" : ""} 
      ${proj.status === "deleting" ? "bg-orange-200 blur-2xl shadow-lg" : ""} 
      ${reqFail ? "bg-red-200 shadow-lg animate-none" : ""} 
     hover:shadow-orange-200 hover:scale-105 opacity-85 hover:opacity-100 transform origin-center`}>
        

      
      <div className="flex flex-row justify-between items-center p-2" onClickCapture={(/*e : React.MouseEvent*/) =>{ /*e.stopPropagation();*/ setIsOpen(!isOpen);}}>
        <div className="flew flex-col space-y-1">
          <div className="text-xl text-white uppercase font-semibold ">
            {proj.name + " " + (proj.originalTime?.split("T")[0] || '')}
          </div>
          <div className="text-sm text-white uppercase font-semibold flew flex-row my-3.5 space-y-1">
            <Image src={service  && service[2] || ""} alt="Description of image" className="relative inline-flex size-8 rounded-full " />
            <p>{"by " + (service && service[0])}</p>
            
          </div>
        </div>
        

        <div className="flex-col space-y-1.5">
          <div className="flex-row space-x-1">
            {["pre-upload", "resting"].includes(proj.status) && (
              <button
                className={`
                 transition-all duration-500 ease-in-out 
                bg-blue-500 text-white text-xl font-bold 
                px-3.5 py-2 rounded-xl border-4 
                border-blue-700 shadow-lg 
                hover:bg-yellow-500 hover:border-yellow-600 
                hover:text-white hover:scale-110 hover:shadow-2xl
                 ${click && "hover:opacity-0 transition-opacity duration-1000"}
                `}

                disabled={click }
                onClick={handleSubmit}
              >
                Request
              </button> 
            ) }
            {
              (roles?.includes("Admin") || proj.user === userId  ) && (
                <button
                className="border-2 rounded-lg px-2 py-0.5 bg-red-600 "
                onClick={handleDelProjDrive}
              >
                del
              </button> 
              )
            }
          </div>
          
          <div className="space-y-3">
            <div className={`relative flex size-4 translate-x-23 translate-y-2`}>
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 
                ${proj.status === "resting" ? "bg-yellow-100" :  (Date.parse(proj.timeReqFullfill) +1000*60*6*24 - Date.now() < 0) ?  null : "bg-red-400"}
                `}
            />
            {/* Main red dot */}
            <span className={`relative inline-flex size-4 rounded-full 
                ${proj.status === "resting" ? "bg-orange-500" : ( Date.parse(proj.timeReqFullfill) +1000*60*60*24 - Date.now() < 0) ?  null : "bg-red-500"}
              `}></span>
          </div>
          {
            
            "onDrive" === proj.status && (
              <a
              href={`https://drive.google.com/drive/folders/${proj.locationOnDrive}`}
              className="transition-all duration-500 ease-in-out 
               bg-green-500 text-white text-xl font-bold 
               px-6 py-3 rounded-xl border-4 
               border-emerald-700 shadow-lg 
               hover:bg-pink-500 hover:border-red-600 
               hover:text-white hover:scale-110 hover:shadow-2xl"
              onClick={(e)=> e.stopPropagation()}
               target="_blank" //open link in new tab
              >
                
              Drive
            </a>       
          )
          }
          <p className="text-3sm text-white my-3 text-center ">{ reqFail? "fail" : click? "requested" : proj.status.toLocaleLowerCase()}</p>
          </div>
          
        </div>
      
      </div>

      {isOpen && (
        <div
          className="p-2 transition-all duration-300 ease-in-out opacity-0 transform scale-95"
          style={{
            opacity: isOpen ? 1 : 0,        // Fade in/out
          }}
        >
          <p className="text-sm">Location on Drive: {proj.locationOnDrive}</p>
          <p className="text-sm">Size: {(proj.size / (1024 ** 3)).toFixed(2)} GB</p>
          <p className="text-sm">Id: {proj._id}</p>
          {proj.group && <p className="text-sm">Group: {proj.group}</p>}
          <button 
          className="btn btn-dash my-2 p-2 hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          onClick={(e)=> {
            e.stopPropagation()
            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_HOST}/${path}?q=${proj._id}${(proj.lock && proj.group? "&type="+proj.group : "")}`); 
            setCopy(true); 
            setTimeout(() => setCopy(false), 5000);}}
          >{copy ? "copied to clipboard!!" : "share"}</button>
        </div>
      )}

    </div>
  );
}
