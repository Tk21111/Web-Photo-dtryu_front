"use client";

import { useState, useEffect } from "react";
import List from "../components/List";
import io from "socket.io-client";

type Proj = {
  _id: string;
  name: string;
  user: string;
  status: string;
  locationOnDisk: string;
  locationOnDrive: string;
  size: number;
  timeReqFullfill: string;
  originalTime: string;
  serviceAcc: number;
};

const socket = io();

export default function ProjList() {
  const [projs, setProjs] = useState<Proj[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      const data: Proj[] = await res.json();
      setProjs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error fetching projects. Please try again later.");
    }
  };

  console.log(error);

  useEffect(() => {
    fetchProjects(); // Initial fetch

    // Listen for real-time updates
    socket.on("change", fetchProjects);

    return () => {
      socket.off("change", fetchProjects); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-box shadow-md py-20 transition delay-150 duration-300 ease-in-out">
            {projs.length > 0 ? (
                projs.map((proj) => (
                  <List key={proj._id} proj={proj}/>
                ))
            ) : (
                <p>No projects found.</p>
            )}
          </div>
  );
}
