"use client";

import { useState } from "react";
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
  timeReqFullfill: number;
};

export default function List({ proj }: { proj: Proj }) {
  const [isOpen, setIsOpen] = useState(false); // Default closed state
  const accessToken = useSelector(selectCurrentToken);
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!proj._id || !["pre-upload", "resting"].includes(proj.status)) return;

    const api = process.env.NEXT_PUBLIC_EXPRESS_API; // Use NEXT_PUBLIC_ for client-side env vars
    if (!api) {
      console.error("API URL is not defined in env variables.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3101/req/req", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projId: proj._id }),
      });

      if (!res.ok) {
        throw new Error(`Failed to request: ${res.statusText}`);
      }

      console.log("Request successful:", await res.json());
    } catch (err) {
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
        }
      })

      const suc = await res.json();

    } catch (err) {
      console.error("Error in request:", err);
    }
  }

  return (
    <div className=" w-full hover:bg-emerald-950 pl-2 py-1 border-2 rounded-2xl shadow-blue-200 shadow-2xl">
      <div className="flex flex-row justify-between items-center p-2" onClickCapture={() => setIsOpen(!isOpen)}>
        <div className="text-xl uppercase font-semibold opacity-60">
          {proj.name}
        </div>

        <div className="flex-col space-y-1.5">
          <div className="flex-row space-x-1">
            {["pre-upload", "resting"].includes(proj.status) && (
              <button
                className="border-2 rounded-lg px-2 py-0.5 bg-blue-600"
                onClick={handleSubmit}
              >
                Request
              </button> 
            ) }
            {
              accessToken && (
                <button
                className="border-2 rounded-lg px-2 py-0.5 bg-red-600"
                onClick={handleDelProjDrive}
              >
                del
              </button> 
              )
            }
          </div>
          
          {
            "onDrive" === proj.status && (
              <a href={`https://drive.google.com/drive/folders/${proj.locationOnDrive}`} className="btn-primary bg-green-700 p-1 rounded-lg border-2 ">Drive</a>
            )
          }
          <p>{proj.status}</p>
        </div>
      
      </div>

      {isOpen && (
        <div className="p-2 transition-all duration-300 ease-in-out">
          <p className="text-sm">Location on Drive: {proj.locationOnDrive}</p>
          <p className="text-sm">Size: {proj.size} Byte</p>
          <p className="text-sm">Id: {proj._id}</p>
        </div>
      )}
    </div>
  );
}
