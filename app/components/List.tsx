"use client";

import { useState } from "react";

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

  const handelSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!proj._id || !["pre-upload", "resting"].includes(proj.status)) return;

    const api = process.env.NEXT_PUBLIC_EXPRESS_API; // Use NEXT_PUBLIC_ for client-side env vars
    if (!api) {
      console.error("API URL is not defined in env variables.");
      return;
    }

    try {
      const res = await fetch(`${api}/req/req`, {
        method: "PATCH",
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

  return (
    <li className="list-col-wrap hover:bg-emerald-950">
      <div className="flex flex-row justify-between items-center p-2" onClickCapture={() => setIsOpen(!isOpen)}>
        <div className="text-xl uppercase font-semibold opacity-60">
          {proj.name}
        </div>

        <div>
          {["pre-upload", "resting"].includes(proj.status) && (
            <button
              className="border-2 rounded-lg px-2 py-0.5 bg-blue-600"
              onClick={handelSubmit}
            >
              Request
            </button> 
            
          ) }
          <p>{proj.status}</p>
        </div>
      
      </div>

      {isOpen && (
        <div className="p-2 transition-all duration-300 ease-in-out">
          <p className="text-sm">Location on Drive: {proj.locationOnDrive}</p>
          <p className="text-sm">Size: {proj.size} MB</p>
          <p className="text-sm">Id: {proj._id}</p>
        </div>
      )}
    </li>
  );
}
