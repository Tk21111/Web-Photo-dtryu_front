"use client";

import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import List from "../components/List";
import { useSelector } from "react-redux";
import { selectRoles, selectUserId } from "../api/redux/authSlice";
import { serviceAccInfo } from "../utils/serviceAccConvertong";


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
  group: string | undefined;
};

const socket = io();

export default function ProjList() {
  const [projs, setProjs] = useState<Proj[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionsPage , setPermissionsPage] = useState<string[]>([]);

  const [copy , setCopy] = useState<boolean>(false);

  const path = usePathname();

  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const permission = searchParams.get("type") || "";
  const searchType = searchParams.get("t") || ""; 

  const router = useRouter()

  const userId = useSelector(selectUserId);
  const roles = useSelector(selectRoles);
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      let data: Proj[] = await res.json();
      data = data.sort((a, b) => Date.parse(b.originalTime) - Date.parse(a.originalTime));
      setProjs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error fetching projects. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProjects(); // Initial fetch

    // Listen for real-time updates
    socket.on("change", fetchProjects);

    return () => {
      socket.off("change", fetchProjects); // Cleanup on unmount
    };
  }, []);

  // ✅ Use memoized filtering instead of modifying state
  const filteredProjs = useMemo(() => {
    
    //set a permission to local storage to keep it for eternity if something bad not happen
    const permissons = localStorage.getItem("permissions") || "";
    let newPermissons = permission ? [permission] : [];

    //filter out dup and all
    newPermissons = newPermissons.filter(val => !permissons.includes(val) && val !== "all")
    if(permissons){
      const Tmp = permissons.split(",");
      newPermissons = [...Tmp , ...newPermissons];
    }

    //set permmisson
    localStorage.setItem("permissions", newPermissons.join(","));

    setPermissionsPage(newPermissons);
    

    return projs.filter(
      (proj) =>     
        (!search || proj._id.includes(search)) &&
        ((!userId ? newPermissons?.includes(proj.group || "") : true) || proj.group === undefined || proj.group === null || proj.group === ""|| permission === "all") &&
        (!searchType || proj.group === searchType) &&
        //when login see only your's projs overwrite when all
        (!userId || proj.user === userId || permission === "all" || roles?.includes("Admin")) 

    );
  }, [projs, search, permission ,userId , roles]);

  return (
    
    <>
      <div className="flex flex-row justify-between">
        <h2 className="justify-center text-3xl font-bold my-2">All Projects</h2>
        <div className="dropdown dropdown-left">
            <div tabIndex={0} role="button" className="btn m-1 bg-gray-300 border-gray-400 hover:bg-gray-600 hover:border-gray-700 hover:scale-110 transition-all duration-300 focus:bg-gray-700">Setting</div>
            <ul tabIndex={0} className="dropdown-content menu-sm bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm">
              <li className="font-semibold">StorageUsed</li>
              <li className="text-sm">{((projs.reduce((sum , curr) => sum + curr.size, 0)) / (1024**3)).toFixed(2) + " / " + (serviceAccInfo.length *14.5) + " GB"}</li>
              <li className="font-semibold">Allow</li>
              <li className="text-gray-400">- public ({ projs.reduce((sum ,curr)=> !curr?.group ? sum+1 : sum ,0)})</li>
              {permissionsPage.map((perm , i)=>(
                  <li key={i} className="text-gray-400">{"- "+ perm.slice(0,10) + (perm.length > 9 ? "..." : "") + " (" +  projs.reduce((sum ,curr) => curr?.group === perm ? sum+1 : sum ,0)+")"}</li>
                ))}
            </ul>
        </div>
        
      </div>
      <div className="flex flex-rol space-x-2 justify-items-center">
        <button className="btn btn-ghost" onClick={()=> router.push("/projs")} disabled={!permissionsPage}>GO TO ALL</button>
        {searchType && 
          <button 
          className="btn btn-dash p-2 hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          onClick={()=> {
            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_HOST}/${path}?${permissionsPage.includes(searchType) || roles?.includes("User") || roles?.includes("Admin") ? `type=${searchType}&` : ""}t=${searchType}`); 
            setCopy(true); 
            setTimeout(() => setCopy(false), 5000);}}
          >{copy ? "copied to clipboard!!" : "share group"}</button>
        }
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-box shadow-md py-20 transition delay-150 duration-300 ease-in-out">
      {filteredProjs.length > 0 ? (
        filteredProjs.map((proj) => <List key={proj._id} proj={proj} />)
      ) : (
        <p>No projects found.</p>
      )}
      {error && <p>{error}</p>}
    </div>
    </>
    
  );
}
