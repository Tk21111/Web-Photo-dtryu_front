"use client";
import { CheckCircle2, Download, DownloadIcon, ArrowLeft, ArrowUpFromLine, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
// IMPORT THE VIEWER
import ModernViewer from "../../components/ImageViewer"; 
import FaceSelect from "@/app/components/FaceSelect";

export default function SimpleGallery() {
  const params = useParams<{ id: string }>();
  const route = useRouter();

  const searchParams = useSearchParams();
  const tagString = searchParams.get("tag");
  const tag = tagString?.split(",") || [];
  const driveId = searchParams.get("driveId");
  const strict = searchParams.get("strict");
  
  const [isFaceSelectOpen , setIsFaceSelectOpen] = useState<boolean>(false);
  const [imageIds, setImageIds] = useState<string[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIndices, setSelectedIndices] = useState<number[] | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Helper: Generate Image URL
  const getImageUrl = (id: string) => {
    return `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}?resize=10`;
  };
  
  // Note: OpenSeadragon usually handles high-res better without resize=50, 
  // but keep it if your server requires it.
  const getImageFullUrl = (id: string) => {
    return `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}?resize=50`;
  };

  // 1. Fetch Image List
  useEffect(() => {
    async function fetchImages() {
      if (!params.id) return;

      try {
        setLoading(true);
        const res = await fetch(tag && tag.length >= 1 ? `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/tagsearch?proj_id=${params.id}&tags=${tagString}&strict=${strict} `: `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/proj/image/${params.id}`, {
            method: "GET",
            cache: "no-store",
            signal: AbortSignal.timeout(2000),
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        
        const data: string[] = await res.json();
        setImageIds(data);
      } catch (err : any) {
        if (err.name === 'TimeoutError') { // Note: It throws 'TimeoutError', not 'AbortError'
          route.push(`${process.env.NEXT_PUBLIC_HOST}/projs/${params.id}?${(tagString ? "tag=" + tagString : "") + (strict ? "together=" + strict : "")}`)
        }
        console.error("Error fetching project images:", err);
        setImageIds([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [params.id , tagString]); 

  // Handle Selection
  const handleImageClick = (e: React.MouseEvent, index: number) => {
    if (e.shiftKey) {
      if (lastSelectedIndex == null) {
        setLastSelectedIndex(index);
        setSelectedIndices([index]);
      } else {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const range = Array.from({ length: end - start + 1 }).map((_, i) => start + i);
        setSelectedIndices((prev) =>
          prev ? [...prev, ...range.filter((val) => !prev.includes(val))] : range
        );
      }
    } else if (e.ctrlKey) {
      setLastSelectedIndex(index);
      setSelectedIndices((prev) =>
        prev?.includes(index) ? prev.filter((i) => i !== index) : prev && [...prev, index]
      );
    } else {
      setCurrentIndex(index);
    }
  };

  // Download Logic
  const handleDownload = () => {
    if (!imageIds) return;
    const targetIndices = selectedIndices && selectedIndices.length > 0 
      ? selectedIndices 
      : imageIds.map((_, i) => i);

    targetIndices.forEach((index) => {
        const id = imageIds[index];
        if (id) {
            window.open(getImageUrl(id), "_blank");
        }
    });
  };

  // Modal Navigation
  const closeModal = useCallback(() => setCurrentIndex(null), []);
  const goLeft = useCallback(() => {
    setCurrentIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);
  const goRight = useCallback(() => {
    setCurrentIndex((prev) =>
      prev !== null && imageIds && prev < imageIds.length - 1 ? prev + 1 : prev
    );
  }, [imageIds]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goRight();
      if (e.key === "ArrowLeft") goLeft();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal, goLeft, goRight]);

  return (
    <div className="flex flex-col p-2 h-full w-full min-h-screen" onClick={() => { setSelectedIndices(null); setLastSelectedIndex(null); }}>
      
      {/* --- Top Bar --- */}
      <div className="fixed top-0 left-0 w-full h-[80px] z-40 px-6 flex items-center justify-between backdrop-blur-md bg-black/20">
        <button 
            onClick={() => route.push("/projs")}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="absolute flex-col z-10 w-[55%] left-1/2 -translate-x-1/2 p-1 top-7 ">
              {isFaceSelectOpen && <div className=" relative w-fit h-fit">
                  <div className="absolute inset-0 flex flex-col backdrop-blur-3xl rounded-4xl bg-gray-800/40"/>
                  <FaceSelect id={params.id} driveId={driveId || ""} imgList={undefined} tagParent={undefined}/>
              </div>}
              <div className="absolute left-1/2 w-1/2 max-sm:left-[10%] -translate-x-1/2">
                  <button className="btn btn-block"  onClickCapture={() => setIsFaceSelectOpen(prev => !prev)}>{isFaceSelectOpen ? <ArrowUpFromLine/> : <SearchIcon/>}</button>
              </div>
          </div>

        <div 
            className="flex items-center gap-3 cursor-pointer bg-gray-800 px-4 py-2 rounded-2xl hover:bg-gray-700 transition select-none"
            onClick={(e) => {
                e.stopPropagation();
                handleDownload();
            }}
        >
            <DownloadIcon size={20} className="text-white"/>
            <span className="text-white font-mono">
                {selectedIndices ? `${selectedIndices.length} Selected` : "Download All"}
            </span>
        </div>
      </div>

      {/* --- Image Grid --- */}
      <div className="flex flex-row flex-wrap gap-4 mt-[100px] justify-center px-4 pb-10">
        {loading && Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[300px] h-[300px] bg-gray-800 animate-pulse rounded-lg"/>
        ))}

        {!loading && imageIds && imageIds.map((id, index) => (
            <div
              key={id}
              className="relative group hover:scale-105 transition-transform duration-200"
            >
              <Image
                src={getImageUrl(id)}
                alt=""
                width={300}
                height={300}
                className={`rounded-lg object-cover cursor-pointer border-2 w-[300px] h-[300px] bg-gray-900
                    ${selectedIndices?.includes(index) ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-transparent"}
                `}
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(e, index);
                }}
                unoptimized
              />
              {selectedIndices?.includes(index) && (
                <div className="absolute top-2 left-2 text-blue-500 bg-white rounded-full p-0.5 shadow-md">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          ))}

          {!loading && imageIds && imageIds.length === 0 && (
             <div className="text-gray-400 text-xl mt-20">No images found in this project.</div>
          )}
      </div>

      {/* --- Fullscreen Modal with OpenSeadragon --- */}
      {currentIndex !== null && imageIds && imageIds[currentIndex] && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* Prevent click propagation on the viewer container */}
          <div className="relative w-full h-full p-0 md:p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button className="absolute top-6 left-6 text-white text-4xl hover:text-gray-300 z-[70] p-2 bg-black/20 rounded-full" onClick={closeModal}>✕</button>

            {/* Download Button */}
            <button 
                className="absolute top-6 right-6 text-white bg-gray-800 p-3 rounded-full hover:bg-gray-700 z-[70]"
                onClick={() => window.open(`/api/download?id=${(imageIds[currentIndex])}`, "_blank")}
            >
                <Download />
            </button>

            {/* Navigation Arrows (Outside the viewer or overlaying edges) */}
            {currentIndex > 0 && (
                <button className="absolute left-4 text-white text-6xl hover:scale-110 transition z-[70] p-4 drop-shadow-lg" onClick={goLeft}>◀</button>
            )}
            {currentIndex < imageIds.length - 1 && (
                <button className="absolute right-4 text-white text-6xl hover:scale-110 transition z-[70] p-4 drop-shadow-lg" onClick={goRight}>▶</button>
            )}

            {/* REPLACED NEXT/IMAGE WITH MODERN VIEWER */}
            <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-black shadow-2xl rounded-lg overflow-hidden border border-gray-800">
                <ModernViewer imageUrl={getImageFullUrl(imageIds[currentIndex])} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}