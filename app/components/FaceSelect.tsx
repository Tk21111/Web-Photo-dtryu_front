"use client"
import Image from "next/image";

const FaceSelect = ({id , driveId} : {id : string, driveId : string | undefined}) => {

  console.log(driveId)
  return (
    <div className="flex w-full justify-center">
        <div className="flex flex-wrap  justify-center space-y-1 space-x-1">
      
        {Array.from({ length: 35 }).map((_, i) => (
            <a
                href={id ? `${process.env.NEXT_PUBLIC_HOST}/projs/${id}?${driveId ? "driveId=" + driveId + "&tag=" + i : ""}` : ""}
                className="relative rounded-full border-2 h-[50px] w-[50px] overflow-hidden"
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