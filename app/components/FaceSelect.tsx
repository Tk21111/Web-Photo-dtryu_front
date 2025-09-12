"use client"
import Image from "next/image";
import React, { useState } from "react";

const FaceSelect = ({id , driveId} : {id : string, driveId : string | undefined}) => {

  const [faceSelected , setFaceSelected] = useState<number[] | null>(null);
  const [faceLastIndex , setFaceLastIndex] = useState<number | null>(null);

  const handleClick = (e : React.MouseEvent , index : number) => {

    if(faceLastIndex == null){
      setFaceSelected([index]);
      setFaceLastIndex(index);
    } else {

      const start = Math.min(index , faceLastIndex);
      const end = Math.max(index , faceLastIndex);

      const range = Array.from({length : end - start -1}).map((_,i) => start + i)
      setFaceSelected(range);
    }
  }

  return (
    <div className="flex w-full justify-center">
        <div className="flex flex-wrap  justify-center space-y-1 space-x-1">
      
        {Array.from({ length: 35 }).map((_, i) => (
            <a
                href={id ? `${process.env.NEXT_PUBLIC_HOST}/projs/${id}?${driveId ? "driveId=" + driveId + "&tag=" + i : ""}` : ""}
                className="relative rounded-full border-2 h-[50px] w-[50px] overflow-hidden"
                key={i}
                >
                <Image
                    key={i}
                    src={`/img/${i}.jpg`}
                    alt={`Image ${i}`}
                    fill
                    className="object-cover rounded-full"
                />
                </a>

            ))}
        </div>
      
    </div>
  );
};


export default FaceSelect;