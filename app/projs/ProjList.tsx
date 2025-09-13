"use client";

import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectRoles, selectUserId } from "../api/redux/authSlice";
import TimeGroup from "../components/TimeGroup";
import { useSession } from "next-auth/react";


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
  lock : boolean | undefined;
  public : boolean
};

const socket = io();

export default function ProjList() {
  const [projs, setProjs] = useState<Proj[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [permissionsPage , setPermissionsPage] = useState<string[]>([]);
  const [groupArr , setGroupArr] = useState<string[]>([]);

  const [copy , setCopy] = useState<boolean>(false);

  const [oldest , setOldest] = useState<number>(0);

  const path = usePathname();

  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const permission = searchParams.get("type") || "";
  const searchType = searchParams.get("t") || ""; 
  const searchUser = searchParams.get("user") || ""; 

  const router = useRouter()

  const userId = useSelector(selectUserId);
  const roles = useSelector(selectRoles);
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic`, {
        cache: "force-cache",
      });

      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      
      let data: Proj[] = await res.json();

      data = data.sort((a, b) => Date.parse(b.originalTime) - Date.parse(a.originalTime));
      
      //date rendeing

    

      setProjs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error fetching projects. Please try again later.");
    }
  };

  const {data : session} = useSession();
  useEffect(() => {
    if (projs && session && session?.user?.tag){
      const proj : Proj = projs[projs.length -1]
      router.prefetch(`/projs/${proj._id}?driveId=${proj.locationOnDrive}&tag${session?.user?.tag}`);
    }
  }, [projs , session]);

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

    //group selector
    projs.forEach((proj) => {
      
      if (proj.group && (roles?.includes("Admin") || roles?.includes("User") || newPermissons.includes(proj.group) || !proj.lock) && !groupArr.includes(proj.group)) {
        //console.log(proj.group)
        setGroupArr([...groupArr , proj.group])
      }
    });

    
    //filter projs
    let projsTmp=  projs.filter(
      (proj) =>     
        (!search || proj._id.includes(search)) &&
        ((!userId ? proj.lock ? newPermissons?.includes(proj.group || "") : true || proj.public  : true) || proj.group === undefined || proj.group === null || proj.group === ""|| permission === "all") &&
        (!searchType || proj.group === searchType) &&
        //when login see only your's projs overwrite when all
        (!userId || proj.user === userId || permission === "all" || roles?.includes("Admin")) &&
        //user 
        (roles?.includes("Admin") || (searchUser ? proj.user == searchUser : true))
    );

    let dateL = Date.parse("2023-03-01T00:00:00.000Z");

    //change oldest to newest
    if(oldest){
      projsTmp = projsTmp.sort((a,b) => Date.parse(a.originalTime) - Date.parse(b.originalTime))
    }
   
 
    const formatProjs : { [key : string ] : Proj[] | null } = {};
    const formatDateLR = [["0 Long Break" , 2] , ["1 Semester 1" , 5 ] , ["2 Short Break" , 1] , ["3 Semester 2" , 4]];
    const formatM = ["M4","M5","M6"]

    let index = 0
    let indexM = 0    
    while (indexM !== 3) {
      //pority arr
      const prio : Proj[] = []
      formatProjs[formatM[indexM] + " " + formatDateLR[index][0]] = projsTmp.filter(
        (proj) => {
          const dateCopy = new Date(dateL);
          dateCopy.setMonth(dateCopy.getMonth() + Number(formatDateLR[index][1]));
          if(((Date.parse(proj.timeReqFullfill) +1000*60*60*24) > Date.now()) && (Date.parse(proj.originalTime) > dateL) && (Date.parse(proj.originalTime) < Date.parse(dateCopy.toString()))){
            prio.push(proj)
          }
          return (Date.parse(proj.originalTime) > dateL) && (Date.parse(proj.originalTime) < Date.parse(dateCopy.toString())) 
        }
          
      )
    
      //remove none timeGroup prevent rendering
      if(formatProjs[formatM[indexM] + " " + formatDateLR[index][0]]?.length === 0){
        delete formatProjs[formatM[indexM] + " " + formatDateLR[index][0]]
      }

      //insert prio list front 
      if(formatProjs[formatM[indexM] + " " + formatDateLR[index][0]] && prio.length > 0){
        const Tmp = formatProjs[formatM[indexM] + " " + formatDateLR[index][0]]?.filter(val => !prio.includes(val))
        formatProjs[formatM[indexM] + " " + formatDateLR[index][0]] = [...prio , ...(Tmp ?? [])];
      }

      //prep next loop
      const dateCopy = new Date(dateL);
      dateCopy.setMonth(dateCopy.getMonth() + Number(formatDateLR[index][1]));
      dateL = Date.parse(dateCopy.toString());
      
      index++;
      if(index === formatDateLR.length){
        index = 0;
        indexM++;
      }
    }

    //hard code without date and overflow
    formatProjs["Overflow7 1"] = projsTmp.filter(
      (proj) => {
          return (Date.parse(proj.originalTime) > Date.parse("2026-03-01T00:00:00.000Z")) || (Date.parse(proj.originalTime) < Date.parse("2023-03-01T00:00:00.000Z") || !proj.originalTime) 
        }
    )

    if(formatProjs["Overflow7 1"].length === 0 ){
      delete formatProjs["Overflow7 1"]
    }

    

    return (formatProjs)

  }, [projs, searchParams, permission ,userId , roles , oldest]);


  const serviceAccList: { [key: number]: number } = {}
  for (const { serviceAcc, size  , status} of projs) {
    if (status === "onDrive"){
      serviceAccList[serviceAcc] = (serviceAccList[serviceAcc] || 0) + size;
    }
  }

  return (
    
    <>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <select
          onChange={(e)=>router.push(e.target.value)}
          className="m-1.5 p-2 mt-[6.5%] border-1 text-xl rounded-3xl hover:scale-110 transition-all delay-150 hover:bg-gray-700 focus:bg-gray-700 shadow-2xs shadow-black h-fit"
        >
          <option value="/projs" className="text-lg">All</option>
          {groupArr.map((val ,i) => <option value={`?t=${val}`} className="bg-transparent text-lg" key={i.toString()}>{val}</option>)}
        </select>
        <select
          className="hover:bg-gray-700 focus:bg-gray-700 shadow-2xs shadow-black duration-150 h-fit mt-[10.7%] rounded-3xl p-1.5 border-1"
          onChange={(e)=> {e.preventDefault(); setOldest(Number(e.target.value))}}
        >
          <option value={0}>Newest</option>
          <option value={1}>Oldest</option>
        </select>
        </div>
        
        <div className="dropdown dropdown-left">
            <div tabIndex={0} role="button" className="btn m-1 bg-gray-300 border-gray-400 hover:bg-gray-600 hover:border-gray-700 hover:scale-110 transition-all duration-300 focus:bg-gray-700">{session ? "Setting" : "Login" }</div>
            {/* <ul tabIndex={0} className="dropdown-content menu-sm bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm text-base-content">
              <li className="font-semibold">StorageUsed</li>
              <li className="text-sm">{((projs.reduce((sum , curr) => sum + curr.size, 0)) / (1024**3)).toFixed(2) + " / " + (serviceAccInfo.length *14.5) + " GB"}</li>
              <li className="font-semibold">Allow</li>
              <li className="text-gray-400">- public ({ projs.reduce((sum ,curr)=> !curr?.group ? sum+1 : sum ,0)})</li>
              {permissionsPage.map((perm , i)=>(
                  <li key={i} className="text-gray-400">{"- "+ perm.slice(0,10) + (perm.length > 9 ? "..." : "") + " (" +  projs.reduce((sum ,curr) => curr?.group === perm ? sum+1 : sum ,0)+")"}</li>
                ))}
              <li className="font-semibold">Service Acc (GB)</li>
              {serviceAccInfo.map((_,  i) => 
                <li key={i} className="text-sm ">{i + " : " + (serviceAccList[Number(i)] ? (serviceAccList[Number(i)] / (1024**3)).toFixed(2) + " / 14.5 " : "Not in use")}</li>
              )}
            </ul> */}
             <ul tabIndex={0} className="dropdown-content menu-sm bg-base-100 rounded-box z-1 w-fit p-2 shadow-sm text-base-content">
              <li className="font-semibold">Welcome</li>      
              <li className=" overflow-clip">{session?.user.email}</li>
              <li className=" overflow-clip">{session?.user.name}</li>
              <li className=" overflow-clip">{session?.user.tag }</li>
            </ul>
        </div>
        
      </div>
      <div className="flex flex-rol space-x-5 justify-items-center ml-3">
        
        {search && <button className="btn btn-ghost hover:bg-gray-600" onClick={()=> router.push(`/projs?t=${projs[0]?.group}`)} disabled={!permissionsPage}>GO TO {projs[0]?.group}</button>}
        {searchType && 
          <button 
          className="btn btn-dash p-2 hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          onClick={()=> {
            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_HOST}/${path}?${permissionsPage.includes(searchType) || roles?.includes("User") || roles?.includes("Admin")  ? `type=${searchType}&` : ""}t=${searchType}${ searchUser ? `&user=${searchUser}` : ""}`); 
            setCopy(true); 
            setTimeout(() => setCopy(false), 5000);}}
          >{copy ? "copied to clipboard!!" : "share group"}</button>
        }
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-box shadow-md py-20 transition delay-150 duration-300 ease-in-out">
      {Object.keys(filteredProjs).length > 0 ? (
        oldest ? Object.keys(filteredProjs).map((key) => (
          <TimeGroup projs={filteredProjs[key]} i={key} key={key}/>
        )) :
        Object.keys(filteredProjs).reverse().map((key) => (
          <TimeGroup projs={filteredProjs[key]} i={key} key={key}/>
        ))
      ) : (
        <p>No projects found.</p>
      )}
      {error && <p>{error}</p>}
      </div>

    </>
    
  );
}
