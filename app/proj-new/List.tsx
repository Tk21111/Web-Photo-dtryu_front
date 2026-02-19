import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Proj } from "../config";

export default function List({ proj }: { proj: Proj }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const router = useRouter();

  const images = proj.image_ids || [];
  const previewImages = showAllImages ? images : images.slice(0, 3);

  return (
    <div className="w-full h-fit pl-2 py-1 border-2 rounded-2xl shadow-2xl bg-accent-content transition-all duration-500 ease-in-out">
      
      <div className="flex flex-col space-y-2 p-2">

        {/* Title */}
        <div className="text-xl text-white uppercase font-semibold">
          {proj.name} {proj.original_time?.split("T")[0] || ""}
        </div>

        {/* Images */}
        {images.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {previewImages.map((id) => (
                <div key={id} className="relative w-20 h-20">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}`}
                    alt={id}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>

            {images.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllImages(!showAllImages);
                }}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-xl w-fit transition-all"
              >
                {showAllImages ? "Show less" : "See all"}
              </button>
            )}
          </>
        )}

        {/* Expand Info Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-xl w-fit transition-all"
        >
          {isOpen ? "Hide Info" : "Show Info"}
        </button>

        {/* Info */}
        {isOpen && (
          <div className="p-2 transition-all duration-300 ease-in-out">
            <p className="text-sm">
              Size: {(proj.size / (1024 ** 3)).toFixed(2)} GB
            </p>
            <p className="text-sm">Id: {proj.proj_id}</p>
            {proj.tag && (
              <p className="text-sm">tag: {proj.tag}</p>
            )}
          </div>
        )}

        {/* ✅ Navigation Button */}
        <button
          onClick={() => router.push(`/proj-new/${proj.proj_id}`)}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-sm font-semibold"
        >
          Open Project
        </button>

      </div>
    </div>
  );
}
