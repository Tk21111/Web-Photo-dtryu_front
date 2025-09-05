"use client";
import FaceSelect from "@/app/components/FaceSelect";
import {  ArrowUpFromLine, Download, DownloadIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TagSearch = {
    driveId: string;
    id : string;
};

type ProjData = {
    _id: string;
};

export default function ProjsChild() {
    const param = useParams<{ id: string }>();
    const searchParams = useSearchParams();

    //everytime reload react see that arr get create so it think there is a undate so keep sending req
    const tagString = searchParams.get("tag")
    const tag = tagString?.split(",") || [];
    const driveId = searchParams.get("driveId")

    const [projData, setProjData] = useState<ProjData | null>(null);
    const [searchData, setSearchData] = useState<TagSearch[] | null>(null);

    const [isFaceSelectOpen , setIsFaceSelectOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    async function tagSearch() {

        if (!driveId) {
            return
        }

        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic/web`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            driveFolder: driveId,
            tags: tag,
            }),
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
        const data: TagSearch[] = await res.json();

        setSearchData(data.length > 0 ? data : null);
        } catch (err) {
        console.error("Error fetching projects:", err);
        }
    }

    useEffect(() => {
        async function fetchProj() {
        try {
            const res = await fetch(
            `${process.env.NEXT_PUBLIC_HOST}/api/projpublic?id=${param.id}`,
            { cache: "no-store" }
            );

            if (!res.ok) throw new Error("Failed to fetch project");
            const data = await res.json();

            if (data && data.length > 0) {
                setProjData(data[0]);
            }
        } catch (err) {
            console.error("Error fetching project:", err);
        }
        }

        if (param.id) fetchProj();
    }, [param.id]);

    useEffect(()=>{
        tagSearch();
    },[tagString])

    const closeModal = useCallback(() => setCurrentIndex(null), []);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    const goLeft = () => {
        if (currentIndex !== null && currentIndex > 0) {
        setCurrentIndex((prev) => (prev !== null ? prev - 1 : null));
        }
    };

    const goRight = () => {
        if (currentIndex !== null && searchData && currentIndex < searchData.length - 1) {
        setCurrentIndex((prev) => (prev !== null ? prev + 1 : null));
        }
    };

    const handleDownloadAll = () => {
      console.log(searchData)
      searchData?.forEach((val) => {
        window.open(`https://drive.google.com/uc?export=download&id=${val.id}`, "_blank");
      });
    };

    
    return (
    <div className="flex flex-col">
        <div className="absolute flex-col z-10 w-[95%] p-1 ">
            {isFaceSelectOpen && <div className=" relative w-fit h-fit">
                <div className="absolute inset-0 flex flex-col backdrop-blur-md rounded-4xl bg-gray-600/40"/>
                <div className=" justify-center">
                    <p className="text-center">Face search</p>
                </div>
                 <FaceSelect id={projData?._id || ""} driveId={driveId || ""}/>
            </div>}
            <div className="w-1/2 translate-x-1/2">
                <button className="btn btn-block"  onClickCapture={() => setIsFaceSelectOpen(prev => !prev)}>{isFaceSelectOpen ? <ArrowUpFromLine/> : <SearchIcon/>}</button>
            </div>
        </div>
        <div 
            className="absolute right-5 top-5 bg-gray-800 p-2 rounded-2xl" 
            onClick={handleDownloadAll}
            >
          <DownloadIcon/>
        </div>
        <div className="flex flex-row flex-wrap gap-4 mt-[8vh] justify-between">
            {searchData &&
                searchData.map((element , index) => (
                <div key={element.id} className="relative">
                    {/* Image */}
                    <Image
                        src={`https://lh3.googleusercontent.com/d/${element.id}=w500`}
                        alt="Drive image"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        onClick={() => setCurrentIndex(index)}
                    />

                    {/* Download Button */}
                    <a
                        href={`https://drive.google.com/uc?export=download&id=${element.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 text-sm"
                    >
                        <DownloadIcon/>
                    </a>
                </div>
            ))}
        </div>

        {/* Fullscreen Modal */}
      {currentIndex !== null && searchData && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal} // close on outside click
        >
          <div
            className="relative w-[90%] h-[90%] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent close on content click
          >
            {/* Close Button */}
            <button
              className="absolute top-5 left-2 bg-white text-black px-2 py-1 rounded"
              onClick={closeModal}
            >
              ✕
            </button>

            <a
                href={`https://drive.google.com/uc?export=download&id=${searchData[currentIndex].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-5 right-15 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 text-sm"
            >
                <Download/>
            </a>

            {/* Left Button */}
            {currentIndex > 0 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full"
                onClick={goLeft}
              >
                ◀
              </button>
            )}

            {/* Right Button */}
            {currentIndex < searchData.length - 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full"
                onClick={goRight}
              >
                ▶
              </button>
            )}

            {/* Google Drive Iframe */}
            <iframe
                src={`https://drive.google.com/file/d/${searchData[currentIndex].id}/preview`}
                className="w-full h-full"
                allow="autoplay"
            ></iframe>
                
          </div>
        </div>
      )}

    </div>
    );
}
