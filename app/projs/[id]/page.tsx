"use client";
import FaceSelect from "@/app/components/FaceSelect";
import { ArrowUpFromLine, CheckCircle2, Download, DownloadIcon, SearchIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

type TagSearch = {
    driveId: string;
    id: string;
};

type ProjData = {
    _id: string;
};

export default function ProjsChild() {
    const param = useParams<{ id: string }>();
    const searchParams = useSearchParams();

    const tagString = searchParams.get("tag");
    const tag = tagString?.split(",") || [];
    const driveId = searchParams.get("driveId");
    const together = searchParams.get("together");

    const [projData, setProjData] = useState<ProjData | null>(null);
    const [searchData, setSearchData] = useState<(TagSearch | null)[] | null>(Array.from({ length: 20 }).map(() => null));

    const [isFaceSelectOpen, setIsFaceSelectOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const [err, setErr] = useState<string | null>(null);
    const [recommend, setRecommend] = useState<{ string: number[] } | null>(null);

    // New State for Redirect
    const [redirectNeeded, setRedirectNeeded] = useState<boolean>(false);

    const [imageLoading, setIamgeLoading] = useState<boolean>(false);
    const [reverseImages, setReverseImage] = useState<boolean>(true);

    const [selcetdImage, setSelectedImage] = useState<number[] | null>(null);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const [driveIdRedirect , setDriveIdRedirect] = useState<string | null>(null);

    const route = useRouter();

    async function tagSearch() {
        setErr(null);
        setRecommend(null);
        setRedirectNeeded(false); // Reset redirect state
        
        try {
            setIamgeLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic/web`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driveFolder: driveId,
                    tags: tag,
                    together: together,
                    projId: param.id
                }),
                cache: "default",
                redirect: "manual" // <--- CRITICAL: Prevents auto-following the redirect
            });

            // Handle Opaque (CORS) Redirects or Explicit 302s
            if (res.type === "opaqueredirect" || res.status === 302) {
                setIamgeLoading(false);
                setRedirectNeeded(true); // Trigger the UI

                const data = await res.json();

                console.log(data.driveFolder)
                setDriveIdRedirect(data.driveFolder)
                return; 
            }

            if (!res.ok) {
                if (res.status === 404) {
                    const data: { recomm: { string: number[] } } = await res.json();
                    setErr("Image not found");
                    setRecommend(data.recomm);
                }
                setIamgeLoading(false);
                // Don't throw here if you handled 404 gracefully above, otherwise:
                if (res.status !== 404) throw new Error(`Failed to fetch data: ${res.status}`);
                return;
            }

            const data: TagSearch[] = await res.json();
            setIamgeLoading(false);

            if (data.length <= 0) {
                return;
            }
            setSearchData(data.reverse());
        } catch (err) {
            console.error("Error fetching projects:", err);
            setIamgeLoading(false);
        }
    }

    // ... (Your handleImageClick, useEffects, closeModal, goLeft, goRight remain unchanged) ...
    // For brevity, I am keeping them implied. Paste your existing logic here.
    
    const handleImageClick = (e: React.MouseEvent, index: number) => {
        // ... your existing logic ...
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
        }
    };
    
    useEffect(() => {
        if(reverseImages){
          setSearchData(prev => prev ? [...prev].reverse() : [null])
        }
    },[reverseImages])

    useEffect(() => {
        async function fetchProj() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic?id=${param.id}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch project");
                const data = await res.json();
                if (data && data.length > 0) setProjData(data[0]);
            } catch (err) { console.error(err); }
        }
        if (param.id) fetchProj();
    }, [param.id]);

    useEffect(() => { tagSearch(); }, [tagString]);

    const closeModal = useCallback(() => setCurrentIndex(null), []);
    const goLeft = useCallback(() => { setCurrentIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev)); }, []);
    const goRight = useCallback(() => { setCurrentIndex((prev) => prev !== null && searchData && prev < searchData.length - 1 ? prev + 1 : prev); }, [searchData]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowRight") goRight();
            if (e.key === "ArrowLeft") goLeft();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal, goLeft, goRight]);

    const handleDownloadAll = () => {
        searchData?.forEach((val) => {
            window.open(`https://drive.google.com/uc?export=download&id=${val?.id}`, "_blank");
        });
    };

    // Handler for the new Redirect Button
    const handleRedirectAction = () => {
        // Since we can't easily read the Location header from a manual fetch (CORS/Opaque),
        // we usually redirect to a known auth URL or the same endpoint to let the browser handle it naturally.
        
        // Option A: If you know where it goes (e.g. Google Login)
        // window.location.href = "https://your-login-url.com";

        // Option B: Retry the exact same URL in the browser window (letting the browser follow the 302 this time)
        const targetUrl = `${process.env.NEXT_PUBLIC_HOST}/api/projpublic/web?driveFolder=${driveId}&tags=${tag}&projId=${param.id}`;
        window.location.href = targetUrl;
    };


    return (
        <div className={`flex flex-col p-2 h-full w-full`}>
            
            {/* ... Top Bar (Unchanged) ... */}
            <div className="fixed h-[100px] w-full  z-50 backdrop-blur-3xl rounded-2xl">
                 {/* ... (Your existing top bar code) ... */}
                  <div className="absolute flex-col z-10 w-[55%] left-1/2 -translate-x-1/2 p-1 top-7 ">
                      {isFaceSelectOpen && <div className=" relative w-fit h-fit">
                          <div className="absolute inset-0 flex flex-col backdrop-blur-3xl rounded-4xl bg-gray-800/40"/>
                          <FaceSelect id={projData?._id || ""} driveId={driveId || ""} imgList={undefined} tagParent={undefined}/>
                      </div>}
                      <div className="absolute left-1/2 w-1/2 max-sm:left-[10%] -translate-x-1/2">
                          <button className="btn btn-block"  onClickCapture={() => setIsFaceSelectOpen(prev => !prev)}>{isFaceSelectOpen ? <ArrowUpFromLine/> : <SearchIcon/>}</button>
                      </div>
                  </div>
                  <div className="absolute left-5 top-7 z-10 w-fit">
                      <button onClick={()=>{route.push("/projs")}}>◀</button>
                  </div>
                  <div className="absolute max-sm:right-[18%] right-20 w-fit top-7 bg-gray-700 focus:bg-gray-700 shadow-2xs shadow-black duration-150 h-fit rounded-2xl p-1.5 border-1">
                      <select onChange={(e) => setReverseImage(e.target.value === "1" ? true : false )}>
                        <option value={1}>newest</option>
                        <option value={0}>oldest</option>
                      </select>
                  </div>
                  <div 
                      className="absolute right-5 top-5 p-2 rounded-2xl flex-col flex w-fit items-center cursor-pointer" 
                      onClick={handleDownloadAll}
                      >
                      <div className="h-fit w-fit p-2 bg-gray-800 rounded-2xl"><DownloadIcon/></div>
                      <p className="text-black h-full w-full text-center">{selcetdImage ?  selcetdImage.length : " all "}</p>
                  </div>
            </div>

            <div className="flex flex-row flex-wrap gap-4 mt-[16vh] justify-between px-4" onClick={() => { setSelectedImage(null); setLastSelectedIndex(null) }}>
                
                {/* --- 302 REDIRECT REQUEST UI --- */}
                {redirectNeeded && (
                    <div className="flex flex-col items-center justify-center w-full h-[50vh] gap-6 animate-in fade-in slide-in-from-bottom-5">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-full">
                            <ExternalLink size={48} className="text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Authorization Required</h2>
                        <p className="text-gray-400 text-center max-w-md">
                            The server requests a redirect (302). This usually means you need to log in or authorize access to view these resources.
                        </p>
                        <button 
                            onClick={handleRedirectAction}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-2"
                        >
                            Proceed to Authorization <ExternalLink size={18}/>
                        </button>
                    </div>
                )}

                {/* Normal Error UI */}
                {!redirectNeeded && err && (
                    <div className="flex h-full w-full justify-center align-middle flex-col text-center">
                        <p className="text-4xl font-bold text-red-600 ">{"⚠️⚠️⚠️" + err + "⚠️⚠️⚠️"}</p>
                        <p>also yes i know the search bar is not center</p>
                    </div>
                )}

                {/* Recommendations UI */}
                {!redirectNeeded && recommend && (
                    <div className="flex flex-col w-full gap-4">
                        <p className="text-4xl font-bold text-primary ">Try this instade</p>
                        {Object.entries(recommend).map(([tag, recs]) => (
                            <div key={tag} className="border p-2 rounded h-fit">
                                <div className="relative rounded-full border-2 border-black h-[50px] w-[50px] overflow-hidden">
                                    <Image
                                        key={tag}
                                        src={`/img/${tag}.jpg`}
                                        alt={`Image ${tag}`}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <FaceSelect id={projData?._id} driveId={driveId} imgList={recs} tagParent={tag} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Normal Search Data Grid */}
                {!redirectNeeded && searchData && !err &&
                    searchData.map((element, index) => (
                        <div key={index} className="relative hover:scale-105 hover:shadow-2xl shadow-black duration-300 rounded-lg h-fit w-fit" >
                            {/* ... Image & Actions (Unchanged) ... */}
                            <Image
                                src={element?.id ? `https://lh3.googleusercontent.com/d/${element?.id}=w500` : "/imgholder.webp"}
                                alt=""
                                width={300}
                                height={300}
                                className={`rounded-lg transition-all  duration-300 cursor-pointer
                                    ${imageLoading ? "bg-black animate-pulse" : "opacity-100"}
                                    ${selcetdImage && selcetdImage.includes(index) ? "shadow-2xl border-4 border-white" : ""}
                                    `}
                                onClick={(e: React.MouseEvent) => {
                                    if (imageLoading) {
                                        return;
                                    }
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleImageClick(e, index)
                                }}
                            />
                            {selcetdImage?.includes(index) && <div className="absolute top-2 left-2">
                                <CheckCircle2 />
                            </div>}

                            {!imageLoading ? <a
                                href={`https://drive.google.com/uc?export=download&id=${element?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 text-sm"
                            >
                                <DownloadIcon />
                            </a> :
                                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 text-sm">
                                    <DownloadIcon />
                                </div>
                            }
                        </div>
                    ))}
            </div>

            {/* ... Modal (Unchanged) ... */}
             {currentIndex !== null && searchData && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeModal}>
                     <div className="relative w-[90%] h-[90%] bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                         <button className="absolute top-5 left-2 bg-white text-black px-2 py-1 rounded" onClick={closeModal}>✕</button>
                         <a href={`https://drive.google.com/uc?export=download&id=${searchData[currentIndex]?.id}`} target="_blank" rel="noopener noreferrer" className="absolute top-5 right-15 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 text-sm"><Download/></a>
                         {currentIndex > 0 && (<button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full" onClick={goLeft}>◀</button>)}
                         {currentIndex < searchData.length - 1 && (<button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full" onClick={goRight}>▶</button>)}
                         <iframe src={`https://drive.google.com/file/d/${searchData[currentIndex]?.id}/preview`} className="w-full h-full" allow="autoplay"></iframe>
                     </div>
                 </div>
             )}
        </div>
    );
}