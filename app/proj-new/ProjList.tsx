"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownFromLine, ArrowUpFromLine } from "lucide-react";
import List from "./List";
import { Proj } from "../config";



export default function ProjNewList() {
  const [projs, setProjs] = useState<Proj[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [oldest, setOldest] = useState<number>(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTag = searchParams.get("t");

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_SERVER}/proj`, {
        cache: "no-store", // Changed to no-store for real-time accuracy
      });



      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Proj[] = await res.json();
      setProjs(data);
      setError(null);
    } catch (err) {
      setError("Error fetching projects. Please try again later.");
    }
  };



  // Derive unique tags for the dropdown
  const uniqueTags = useMemo(() => {
    const tags = projs.map(p => p.tag).filter((t): t is string => !!t);
    return Array.from(new Set(tags));
  }, [projs]);

  useEffect(() => {
    fetchProjects()
  },[])

  const filteredProjs = useMemo(() => {
    // 1. Sort projects based on toggle
    let baseProjs = [...projs].sort((a, b) => {
      const timeA = Date.parse(a.original_time || "0");
      const timeB = Date.parse(b.original_time || "0");
      return oldest ? timeA - timeB : timeB - timeA;
    });

    // 2. Filter by Tag (from URL search params)
    if (currentTag) {
      baseProjs = baseProjs.filter((p) => p.tag === currentTag);
    }

    const formatProjs: Record<string, Proj[]> = {};
    const periods = [
      ["Long Break", 2],
      ["Semester 1", 5],
      ["Short Break", 1],
      ["Semester 2", 4],
    ] as const;
    const grades = ["M4", "M5", "M6"];

    let currentRangeStart = new Date("2023-03-01T00:00:00.000Z");

    // 3. Group projects into Academic Windows
    grades.forEach((grade) => {
      periods.forEach(([periodName, months]) => {
        const nextRangeStart = new Date(currentRangeStart);
        nextRangeStart.setMonth(nextRangeStart.getMonth() + months);

        const groupKey = `${grade} ${periodName}`;
        const projectsInPeriod = baseProjs.filter((p) => {
          const pTime = Date.parse(p.original_time);
          return pTime >= currentRangeStart.getTime() && pTime < nextRangeStart.getTime();
        });

        if (projectsInPeriod.length > 0) {
          formatProjs[groupKey] = projectsInPeriod;
        }

        currentRangeStart = nextRangeStart;
      });
    });

    // 4. Handle Overflow (Dates outside the 2023-2026 range)
    const overflow = baseProjs.filter((p) => {
      const pTime = Date.parse(p.original_time);
      return (
        !p.original_time ||
        pTime < new Date("2023-03-01").getTime() ||
        pTime >= new Date("2026-03-01").getTime()
      );
    });

    if (overflow.length > 0) {
      formatProjs["Other"] = overflow;
    }

    return Object.keys(formatProjs).length === 0 ? { All: baseProjs } : formatProjs;
  }, [projs, oldest, currentTag]);

  return (
    <>
      <div className="flex flex-row justify-between items-end mb-4">
        <div className="flex flex-row gap-2">
          <select
            value={currentTag || "/projs"}
            onChange={(e) => router.push(e.target.value === "/projs" ? "/projs" : `?t=${e.target.value}`)}
            className="p-2 border rounded-3xl hover:bg-gray-700 transition-colors shadow-sm bg-gray-800 text-white"
          >
            <option value="/projs">All Tags</option>
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded-3xl hover:bg-gray-700 transition-colors shadow-sm bg-gray-800 text-white"
            onChange={(e) => setOldest(Number(e.target.value))}
          >
            <option value={0}>Newest First</option>
            <option value={1}>Oldest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-10">
        {Object.keys(filteredProjs).map((key) => (
          <TimeGroup 
            key={key} 
            title={key} 
            projs={filteredProjs[key]} 
          />
        ))}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </>
  );
}

function TimeGroup({ title, projs }: { title: string; projs: Proj[] }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!projs.length) return null;

  const displayProjs = isOpen ? projs : projs.slice(0, 2);
  const ArrowIcon = isOpen ? ArrowUpFromLine : ArrowDownFromLine;

  return (
    <div
      className={`flex flex-col p-4 shadow-xl rounded-3xl transition-all cursor-pointer ${
        isOpen ? "bg-gray-700 ring-2 ring-gray-500" : "bg-gray-800 hover:bg-gray-700"
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xl font-bold">{title}</span>
          <span className="ml-2 text-gray-400">({projs.length})</span>
        </div>
        <ArrowIcon className="w-8 h-8 p-1.5 bg-gray-900 rounded-full" />
      </div>

      <div className="space-y-2">
        {displayProjs.map((proj) => (
          <List key={proj.proj_id} proj={proj} />
        ))}
      </div>

      {!isOpen && projs.length > 2 && (
        <p className="text-center text-sm text-gray-400 mt-2">Show {projs.length - 2} more...</p>
      )}
    </div>
  );
}