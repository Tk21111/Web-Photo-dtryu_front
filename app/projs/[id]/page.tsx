"use client";
import FaceSelect from "@/app/components/FaceSelect";
import {  ArrowUpFromLine, CheckCheckIcon, CheckCircle2, Download, DownloadIcon, SearchIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

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
    const [searchData, setSearchData] = useState<TagSearch[] | null[] | null >(Array.from({length : 20}).map(val => null));

    const [isFaceSelectOpen , setIsFaceSelectOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const [imageLoading , setIamgeLoading] = useState<boolean>(false);
    const [reverseImages , setReverseImage] = useState<any>(true);

    const [selcetdImage , setSelectedImage] = useState<number[] | null>(null);
    const [lastSelectedIndex , setLastSelectedIndex] = useState<number | null>(null);

    const route = useRouter();
    

    async function tagSearch() {

        if (!driveId) {
            return
        }

        try {
        setIamgeLoading(true);
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
        setIamgeLoading(false);

        if(data.length <= 0 ){
          return;
        }
        setSearchData(data.reverse());
        } catch (err) {
        console.error("Error fetching projects:", err);
        }
    }

    const handleImageClick = (e: React.MouseEvent , index : number) => {
       if(e.shiftKey){

        if(lastSelectedIndex == null){

          setLastSelectedIndex(index);
          setSelectedImage([index]);
        } else {
          const start = Math.min(lastSelectedIndex , index);
          const end = Math.max(lastSelectedIndex , index);

          const range = Array.from({length : end - start +1 }).map((_,i) => start + i)

          setSelectedImage(prev => prev ? [...prev , ...range.filter(val => !prev.includes(val))] : range);
        }
      } else if(e.ctrlKey) {
          setLastSelectedIndex(index); 
          setSelectedImage(prev =>
                prev?.includes(index) ? prev.filter(i => i !== index) : prev && [ ...prev , index]
              );      
      } else {
        setCurrentIndex(index);
        //pakapong
      }
    }

    useEffect(() => {
      if(reverseImages){
        setSearchData(prev => prev ? [...prev].reverse() : [null])
      }
    },[reverseImages])

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

    const goLeft = useCallback(() => {
      setCurrentIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, []);

    const goRight = useCallback(() => {
      setCurrentIndex((prev) =>
        prev !== null && searchData && prev < searchData.length - 1 ? prev + 1 : prev
      );
    }, [searchData]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === "Escape") closeModal();
          if (e.key === "ArrowRight") goRight();
          if (e.key === "ArrowLeft") goLeft();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal , goLeft , goRight]);

   

    const handleDownloadAll = () => {
      searchData?.forEach((val) => {
        window.open(`https://drive.google.com/uc?export=download&id=${val?.id}`, "_blank");
      });
    };
    
    return (
    <div className="flex flex-col">
        <div className="fixed h-[100px] w-full  z-50 backdrop-blur-3xl rounded-2xl">
          <div className="absolute flex-col z-10 w-[55%] left-1/2 -translate-x-1/2 p-1 top-7 ">
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
          <div className="absolute left-5 top-7 z-10 w-fit">
              <button onClick={()=>{route.push("/projs")}}>
                ◀
              </button>
          </div>
          <div className="absolute right-20 w-fit top-7 bg-gray-700 focus:bg-gray-700 shadow-2xs shadow-black duration-150 h-fit rounded-2xl p-1.5 border-1">
              <select onChange={(e) => setReverseImage(e.target.value)}>
                <option value={1}>newest</option>
                <option value={0}>oldest</option>
              </select>
          </div>
          <div 
              className="absolute right-5 top-5 p-2 rounded-2xl flex-col flex w-fit items-center" 
              onClick={handleDownloadAll}
              >
              <div className="h-fit w-fit p-2 bg-gray-800 rounded-2xl">
                <DownloadIcon/>
              </div>
              <p className="text-black h-full w-full text-center">{selcetdImage ?  selcetdImage.length : " all "}</p>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap gap-4 mt-[16vh] justify-between px-4" onClick={()=> {setSelectedImage(null); setLastSelectedIndex(null)}}>
            {/* { imageLoading && 
              <div className="flex h-full w-full justify-center align-middle">
                <Loader2Icon/>
              </div>
            } */}
            {searchData &&
                searchData.map((element , index) => (
                <div key={index} className="relative hover:scale-105 hover:shadow-2xl shadow-black duration-300 rounded-lg h-fit w-fit" >
                    {/* Image */}
                    <Image
                        src={element?.id ? `https://lh3.googleusercontent.com/d/${element?.id}=w500` : "/imgholder.webp"}
                        alt=""
                        width={300}
                        height={300}
                        className={`rounded-lg transition-all  duration-300 
                            ${ imageLoading ? "bg-black animate-pulse" : "opacity-100"}
                            ${ selcetdImage && selcetdImage.includes(index) ? "shadow-2xl border-4 border-white" : ""}
                            `}   
                            
                        onClick={(e : React.MouseEvent)=> {
                          e.preventDefault();
                          e.stopPropagation();

                          handleImageClick(e , index)
                        }}

                    />
                    {selcetdImage?.includes(index) && <div className="absolute top-2 left-2">
                      <CheckCircle2/>
                    </div>}

                    {/* Download Button */}
                    <a
                        href={`https://drive.google.com/uc?export=download&id=${element?.id}`}
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
                href={`https://drive.google.com/uc?export=download&id=${searchData[currentIndex]?.id}`}
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
                src={`https://drive.google.com/file/d/${searchData[currentIndex]?.id}/preview`}
                className="w-full h-full"
                allow="autoplay"
            ></iframe>
                
          </div>
        </div>
      )}

    </div>
    );
}
