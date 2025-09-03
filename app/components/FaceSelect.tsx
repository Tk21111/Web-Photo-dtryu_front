import Image from "next/image";

const FaceSelect = ({driveLink} : {driveLink : string}) => {
  return (
    <div className="flex w-full justify-center">
        <div className="flex flex-wrap  justify-center space-y-1 space-x-1">
      
        {Array.from({ length: 35 }).map((_, i) => (
            <a
                href={driveLink ? `https://drive.google.com/drive/search?q=title:%5B${i}%5D%20parent:${driveLink}` : ""}
                target="_blank"
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