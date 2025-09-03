import Image from "next/image";

const page = () => {
  return (
    <div className="flex w-full justify-center">
        <div className="flex flex-wrap lg:w-1/2  justify-center space-y-1 space-x-1">
      
        {Array.from({ length: 35 }).map((_, i) => (
            <a href="">
                <Image
                    key={i}
                    src={`/img/${i}.jpg`}
                    alt={`Image ${i}`}
                    width={50}
                    height={50}
                    className="object-contain btn-circle rounded-full"
                    />
            </a>
            ))}
        </div>
      
    </div>
  );
};

export default page;
