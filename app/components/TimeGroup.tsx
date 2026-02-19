"use client";

import { useState } from "react";
import { ArrowDownFromLine, ArrowUpFromLine } from "lucide-react";
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
  originalTime: string;
  serviceAcc: number;
  group: string | undefined;
  lock: boolean | undefined;
  public: boolean;
};

interface TimeGroupProps {
  i: string;
  projs: Proj[] | null;
}

export default function TimeGroup({ i, projs }: TimeGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!projs) {
    return ( <div>null</div>)
  }
  const projsFilter: Proj[] = isOpen ? projs : projs.slice(0, 2);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const ArrowIcon = isOpen ? ArrowUpFromLine : ArrowDownFromLine;
  const iconClass =
    "bg-gray-800 rounded-2xl w-10 h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer";

  return (
    <div
      className={`flex flex-col space-y-1.5 px-3 py-2 shadow-2xl rounded-3xl h-full justify-baseline content-center transition-all duration-100 ${
        isOpen && "bg-gradient-to-tr from-gray-500 to-gray-600"
      }`}
      onClick={toggle}
    >
      <div className="flex flex-col space-y-1 my-2">
        <div className="flex flex-row justify-between py-0.5 px-2.5">
          <div className="flex flex-row space-x-2">
            <p className="text-xl font-bold">
              {i.split(" ")[0] + " " + i.split(" ")[2] + i.split(" ")[3]}
            </p>
            <p className="text-end mt-0.5">
              {": " +
                (projs.length > 2 ? projs.length + " ..." : projs.length)}
            </p>
          </div>
          <ArrowIcon onClick={toggle} className={iconClass} />
        </div>

        {projsFilter.map((proj) => (
          <List key={proj._id} proj={proj} />
        ))}
      </div>

      <div className="flex flex-col justify-center py-0.5 px-2.5">
        <ArrowIcon onClick={toggle} className="bg-gray-800 rounded-2xl w-[100%] h-8 p-1.5 hover:bg-gray-600 duration-100 cursor-pointer" />
      </div>
    </div>
  );
}