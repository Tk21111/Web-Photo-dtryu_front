"use client";

import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../api/redux/authSlice";
import { json } from "stream/consumers";

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
};

export default function List({ proj }: { proj: Proj }) {
  const [isOpen, setIsOpen] = useState(false); // Default closed state
  const [click , setClick] = useState(false);
  const [reqFail ,setreqFail]= useState(false);
  const accessToken = useSelector(selectCurrentToken);
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!proj._id || !["pre-upload", "resting"].includes(proj.status) || click) return;

    const api = process.env.NEXT_PUBLIC_EXPRESS_API; // Use NEXT_PUBLIC_ for client-side env vars
    if (!api) {
      console.error("API URL is not defined in env variables.");
      return;
    }

    setClick(true)
    try {
      const res = await fetch("http://localhost:3101/req/req", {
        method: "POST",
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

    e.preventDefault();

    if(!proj._id) return null
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API}/drive/del` ,{
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
    if(proj.status === "uploading"){
      setClick(true)
    } else if (proj.status === "upload fail"){
      setreqFail(true)
    }
  },[proj])


  return (
    <div className={`w-full h-[20vh] pl-2 py-1 border-2 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out
      ${isOpen && "h-full"}
      ${proj.status === "uploading" || click ? "bg-orange-300 text-orange-800 animate-pulse" : ""}
      ${proj.status === "onDrive" ? " text-white" : ""} 
      ${proj.status === "delting" ? "bg-orange-200 blur-2xl shadow-lg" : ""} 
      ${reqFail ? "bg-red-200 shadow-lg animate-none" : ""} 
     hover:shadow-orange-200 hover:scale-105 opacity-85 hover:opacity-100 transform origin-center`}>
        <div className={`relative flex size-4`}>
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 
              ${proj.status === "resting" ? "bg-yellow-100" : "bg-red-400"}
              `}
          />
          {/* Main red dot */}
          <span className={`relative inline-flex size-4 rounded-full 
              ${proj.status === "resting" ? "bg-orange-500" : "bg-red-500"}
            `}></span>
        </div>

      
      <div className="flex flex-row justify-between items-center p-2" onClickCapture={() => setIsOpen(!isOpen)}>
        <div className="text-xl text-white uppercase font-semibold ">
          {proj.name + " " + (proj.originalTime?.split("T")[0] || '')}
        </div>

        <div className="flex-col space-y-1.5">
          <div className="flex-row space-x-1">
            {["pre-upload", "resting"].includes(proj.status) && (
              <button
                className={`border-2 rounded-lg px-2 py-0.5 bg-blue-600 w-2lg hover:bg-yellow-400 transition-colors duration-1000
                 ${click && "hover:opacity-0 transition-opacity duration-1000"}
                `}

                disabled={click }
                onClick={handleSubmit}
              >
                Request
              </button> 
            ) }
            {
              accessToken && (
                <button
                className="border-2 rounded-lg px-2 py-0.5 bg-red-600 "
                onClick={handleDelProjDrive}
              >
                del
              </button> 
              )
            }
          </div>
          
          {
            "onDrive" === proj.status && (
              <a
              href={`https://drive.google.com/drive/folders/${proj.locationOnDrive}`}
              className="transition-colors duration-1000 ease-in-out bg-green-500 p-1 rounded-lg border-2 border-emerald-700 hover:bg-pink-500 hover:border-red-600 hover:text-white"
            >
              Drive
            </a>       
          )
          }
          <p className="text-3sm text-white">{ reqFail? "fail" : click? "requested" : proj.status.toLocaleLowerCase()}</p>
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
          <p className="text-sm">Size: {Math.round(proj.size / (1024 ** 3))} GB</p>
          <p className="text-sm">Id: {proj._id}</p>
        </div>
      )}

    </div>
  );
}
