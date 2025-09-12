"use client"
import { CheckCircle2, SearchCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const FaceSelect = ({id , driveId} : {id : string, driveId : string | undefined}) => {

  const [selcetdImage , setSelectedImage] = useState<number[] | null>(null);
  const [lastSelectedIndex , setLastSelectedIndex] = useState<number | null>(null);

  const {data : session } = useSession();

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
            setLastSelectedIndex(index);
            setSelectedImage([index]);
            
        }
      }

  const router = useRouter()
  const handleSearchClick = ()=>{
    router.push(id ? `${process.env.NEXT_PUBLIC_HOST}/projs/${id}?${driveId ? "driveId=" + driveId + "&tag=" + selcetdImage?.join(",") : ""}` : "")
  }

  return (
    <>
      { session && <div className="flex w-full justify-center flex-col">
          <div className="flex flex-wrap  justify-center space-y-1 space-x-1">
        
          {Array.from({ length: 35 }).map((_, i) => (
              <div
                  onClick={(e) =>(handleImageClick(e , i))}
                  className={`relative rounded-full border-2 border-black h-[50px] w-[50px] overflow-hidden
                              ${selcetdImage?.includes(i) ? "border-white shadow-2xl shadow-black" : ""}
                    `}
                  key={i}

                  >
                  {selcetdImage?.includes(i) && <div className="">
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
              <div onClick={handleSearchClick} className="flex h-full w-full content-center items-center">
                <SearchCheck/>
              </div>
          </div>
          
        
      </div>}
    </>
    
  );
};


export default FaceSelect;