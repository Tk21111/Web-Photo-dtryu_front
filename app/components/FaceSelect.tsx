"use client"
import { CheckCircle2, SearchCheck } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const FaceSelect = ({id , driveId , imgList , tagParent} : {id : string  | undefined, driveId : string | undefined | null, imgList : number[] | undefined , tagParent : string | undefined}) => {

  const [selcetdImage , setSelectedImage] = useState<number[] | null>(null);
  const [lastSelectedIndex , setLastSelectedIndex] = useState<number | null>(null);

  const faceSelectRef = useRef<HTMLDivElement | null>(null);

  //read param
  const searchParams = useSearchParams();
  const tagString = searchParams.get("tag");
  const tag = tagString?.split(",") || [];

  //defalut if nothing
  const imagLists : number[] = imgList?.map(Number) ||  Array.from({length : 35}).map((_,i)=> i) ;

  const imgListFormatted = imagLists?.map(t => Number(t)).filter(n => !isNaN(n))
  useEffect(() => {
    if (tag && tag.length > 0 && !tagParent && !imgList){
      const numericTags = tag.map(t => Number(t)).filter(n => !isNaN(n)); // convert to numbers and remove invalid
      setSelectedImage(numericTags);
    }
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (faceSelectRef.current && !faceSelectRef.current.contains(event.target as Node)) {
        setSelectedImage(null);
        setLastSelectedIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageClick = (e: React.MouseEvent , index : number) => {

        if(e.shiftKey && lastSelectedIndex){
   
          const start = Math.min(lastSelectedIndex , index);
          const end = Math.max(lastSelectedIndex , index);

          const range = Array.from({length : end - start +1 }).map((_,i) => start + i)

          setSelectedImage(prev => prev ? [...prev , ...range.filter(val => !prev.includes(val))] : range);
        
        } else if(e.ctrlKey) {
            setLastSelectedIndex(index); 
            setSelectedImage(prev =>
                  prev?.includes(index) ? prev.filter(i => i !== index) : prev && [ ...prev , index]
                );      
        } else {

            if(selcetdImage?.includes(index)){
              setSelectedImage(prev => prev ? prev.filter(val => val !== index) : prev)
              if(lastSelectedIndex === index){
                setLastSelectedIndex(null);
              }
            } else {
              setLastSelectedIndex(index);
              setSelectedImage([index]);
            }       
        }
      }

  const router = useRouter()

  console.log(imgListFormatted)
  const handleSearchClick = (together : boolean)=>{
    if (!selcetdImage) return;
    if (selcetdImage?.length === 0) {
        router.push(`${process.env.NEXT_PUBLIC_HOST}/proj-new/${id}`);
        return;
    }
    if (selcetdImage?.length === imgListFormatted?.length && !together){
      window.open(`https://drive.google.com/drive/folders/${driveId}`, "_blank");
    } else if (selcetdImage?.length > 0 && id) {
        if (!driveId) {
          router.push(`${process.env.NEXT_PUBLIC_HOST}/proj-new/${id}?${"&tag=" + selcetdImage.map(val => imgListFormatted.at(val))?.join(",") + (tagParent ? "," + tagParent : "") + (together ? "&strict=true" : "")}`)
        } else {
          router.push(`${process.env.NEXT_PUBLIC_HOST}/projs/${id}?${(driveId ? "driveId=" + driveId + "&tag=" + selcetdImage.map(val => imgListFormatted.at(val))?.join(",") + (tagParent ? "," + tagParent : ""): "") + (together ? "&together=true" : "")}`)
        }
      } 
  }

  return (
    <>
      {  <div className="flex w-full p-2 justify-center flex-col h-full cursor-pointer " ref={faceSelectRef}>
          <div className="flex flex-wrap  justify-center space-y-1 space-x-1">
        
          {imgList ? 
            imgList.map((ele , index)=>(
              <div
                  onClick={(e) =>(handleImageClick(e , index))}
                  className={`relative rounded-full border-2 border-black h-[50px] w-[50px] overflow-hidden 
                              ${selcetdImage?.includes(index) ? "border-white shadow-2xl shadow-black" : selcetdImage && selcetdImage?.length > 0 ? " opacity-70" : ""}
                    `}
                  key={ele}

                  >
                  {selcetdImage?.includes(index) && <div className=" absolute top-1/2 left-1/2 z-10">
                    <CheckCircle2/>
                  </div>}
                  <Image
                      key={ele}
                      src={`/img/${ele}.jpg`}
                      alt={`Image ${ele}`}
                      fill
                      className="object-cover rounded-full "
                  />
                  </div>

            ))
          : Array.from({ length: 35 }).map((_, i) => (
              <div
                  onClick={(e) =>(handleImageClick(e , i))}
                  className={`relative rounded-full border-2 border-black h-[50px] w-[50px] overflow-hidden
                              ${selcetdImage?.includes(i) ? "border-white shadow-2xl shadow-black" : selcetdImage ? " opacity-70" : ""}
                    `}
                  key={i}

                  >
                  {selcetdImage?.includes(i) && <div className=" absolute top-1/2 left-1/2 z-10">
                    <CheckCircle2/>
                  </div>}
                  <Image
                      key={i}
                      src={`/img/${i}.jpg`}
                      alt={`Image ${i}`}
                      fill
                      className="object-cover rounded-full"
                  />
                  </div>

              ))}
              <div  className="flex flex-row h-full w-full items-center justify-center space-x-[5%] z-10">
                    <button className="btn" onClick={() => handleSearchClick(true)}>Together <SearchCheck/></button>
                    <button className="btn" onClick={() => handleSearchClick(false)}>Invidual <SearchCheck/></button>
              </div>
          </div>
          
        
      </div>}
    </>
    
  );
};


export default FaceSelect;