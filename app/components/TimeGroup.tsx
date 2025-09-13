"use client";

import { useState } from "react";
import { ArrowDownFromLine, ArrowUpFromLine } from 'lucide-react';
import List from "./List";

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

export default function TimeGroup({ i , projs}: { i : string , projs: Proj[] | null }) {
  const [isOpen, setIsOpen] = useState(false); // Default closed state 

  const projsFilter = isOpen ? projs : projs?.slice(0,2)

  return (
        <div className={
            `flex flex-col space-y-1.5 px-3 py-2 shadow-2xl rounded-3xl h-full justify-baseline content-center transition-all duration-100 
                ${isOpen && "bg-gradient-to-tr from-gray-500 to-gray-600"}`
        } onClick={() => {setIsOpen(!isOpen);}}>
            <div className="flex flex-col space-y-1 my-2">
                <div className="flex flex-row justify-between py-0.5 px-2.5">
                    <div className="flex flex-row space-x-2">
                        <p className="text-xl font-bold">{i.split(" ")[0] +" "+ i.split(" ")[2] + i.split(" ")[3]}</p>
                        <p className="text-end mt-0.5">{": " + (projs?.length && projs.length> 2 ? projs?.length + " ..." : projs?.length)}</p>
                    </div>
                    
                    { !isOpen &&<ArrowDownFromLine onClick={() => setIsOpen(!isOpen)} className="bg-gray-800 rounded-2xl w-10 h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer "/>}
                    { isOpen && <ArrowUpFromLine onClick={() => setIsOpen(!isOpen)} className="bg-gray-800 rounded-2xl w-10 h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer" />}
                    
                </div>
                
                {projsFilter?.map((proj) => <List key={proj._id} proj={proj}/>)}
            </div>
            <div className="flex flex-col justify-center py-0.5 px-2.5">
                {isOpen && <ArrowUpFromLine onClick={() => setIsOpen(!isOpen)} className="bg-gray-800 rounded-2xl w-[100%] h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer" />}
                {!isOpen && <ArrowDownFromLine onClick={() => setIsOpen(!isOpen)} className="bg-gray-800 rounded-2xl w-[100%] h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer" />}
                
            </div>
            
        </div>

  );
}
