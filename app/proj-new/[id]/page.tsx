"use client";


import Image from "next/image";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, DownloadIcon } from "lucide-react";

/* -------------------- SAFE DYNAMIC IMPORT -------------------- */
const ModernViewer = dynamic(
  () => import("../../components/ImageViewer"),
  { ssr: false }
);

/* ============================================================= */

export default function SimpleGallery() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tagString = searchParams.get("tag");
  const strict = searchParams.get("strict");

  const tags = tagString?.split(",") ?? [];

  const [imageIds, setImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  /* ===================== URL HELPERS ===================== */

  const getThumbUrl = (id: string) =>
    `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}?resize=400`;

  const getFullUrl = (id: string) =>
    `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}?resize=2000`;

  /* ===================== FETCH IMAGES ===================== */

  useEffect(() => {
    if (!params.id) return;

    const controller = new AbortController();

    async function fetchImages() {
      try {
        setLoading(true);

        const endpoint =
          tags.length > 0
            ? `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/tagsearch?proj_id=${params.id}&tags=${tagString}&strict=${strict}`
            : `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/proj/image/${params.id}`;

        const res = await fetch(endpoint, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const data: string[] = await res.json();
        setImageIds(data);
      } catch (err) {
        console.error("Image fetch error:", err);
        setImageIds([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
    return () => controller.abort();
  }, [params.id, tagString, strict]);

  /* ===================== SELECTION ===================== */

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();

    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const range = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );

      setSelectedIndices((prev) =>
        Array.from(new Set([...prev, ...range]))
      );
      return;
    }

    if (e.ctrlKey) {
      setSelectedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
      setLastSelectedIndex(index);
      return;
    }

    setCurrentIndex(index);
  };

  /* ===================== DOWNLOAD ===================== */

const handleDownload = async () => {
  const targets =
    selectedIndices.length > 0
      ? selectedIndices
      : imageIds.map((_, i) => i);

  const selectedIds = targets
    .map((index) => imageIds[index])
    .filter(Boolean);

  if (selectedIds.length === 0) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/images/zip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_ids: selectedIds,
        }),
      }
    );

    if (!res.ok) throw new Error("Zip download failed");

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      selectedIds.length === imageIds.length
        ? "all_images.zip"
        : `selected_${selectedIds.length}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
};

  const downloadSingle = (id: string) => {
    // We use the dl=1 flag we set up in your Go server
    const url = `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${id}?dl=1`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${id}.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ===================== MODAL NAVIGATION ===================== */

  const closeModal = useCallback(() => setCurrentIndex(null), []);

  const goLeft = useCallback(() => {
    setCurrentIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : prev
    );
  }, []);

  const goRight = useCallback(() => {
    setCurrentIndex((prev) =>
      prev !== null && prev < imageIds.length - 1
        ? prev + 1
        : prev
    );
  }, [imageIds.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight") goRight();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeModal, goLeft, goRight]);

  /* ===================== RENDER ===================== */

  return (
    <div
      className="flex flex-col min-h-screen w-full p-2"
      onClick={() => {
        setSelectedIndices([]);
        setLastSelectedIndex(null);
      }}
    >
      {/* ---------------- TOP BAR ---------------- */}
      <div className="fixed top-0 left-0 w-full h-[80px] z-40 px-6 flex items-center justify-between backdrop-blur-md bg-black/20">

        <button
          onClick={() => router.push("/projs")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-2xl hover:bg-gray-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <DownloadIcon size={20} className="text-white" />
          <span className="text-white font-mono">
            {selectedIndices.length > 0
              ? `${selectedIndices.length} Selected`
              : "Download All"}
          </span>
        </div>
      </div>

      {/* ---------------- GRID ---------------- */}
      <div className="flex flex-wrap gap-4 mt-[100px] justify-center px-4 pb-10">

        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[300px] h-[300px] bg-gray-800 animate-pulse rounded-lg"
            />
          ))}

        {!loading &&
          imageIds.map((id, index) => (
            <div key={id} className="relative group">

              <Image
                src={getThumbUrl(id)}
                alt=""
                width={300}
                height={300}
                unoptimized
                className={`w-[300px] h-[300px] object-cover rounded-lg cursor-pointer border-2
                ${
                  selectedIndices.includes(index)
                    ? "border-blue-500 shadow-lg"
                    : "border-transparent"
                }`}
                onClick={(e) => handleImageClick(e, index)}
              />

              {selectedIndices.includes(index) && (
                <div className="absolute top-2 left-2 text-blue-500 bg-white rounded-full p-1">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          ))}

        {!loading && imageIds.length === 0 && (
          <div className="text-gray-400 text-xl mt-20">
            No images found.
          </div>
        )}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {currentIndex !== null && imageIds[currentIndex] && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative w-full h-full max-w-[95vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            {/* --- TOP CONTROLS (Close and Download) --- */}
      <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-50">
        <button
          className="text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all"
          onClick={closeModal}
        >
          <ArrowLeft size={24} />
        </button>

        {/* NEW DOWNLOAD BUTTON */}
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl backdrop-blur-md shadow-lg transition-all"
          onClick={() => downloadSingle(imageIds[currentIndex])}
        >
          <Download size={20} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
            {/* Nav */}
            {currentIndex > 0 && (
              <button
                className="absolute left-6 top-1/2 text-white text-5xl z-50"
                onClick={goLeft}
              >
                ◀
              </button>
            )}

            {currentIndex < imageIds.length - 1 && (
              <button
                className="absolute right-6 top-1/2 text-white text-5xl z-50"
                onClick={goRight}
              >
                ▶
              </button>
            )}

            {/* OpenSeadragon Viewer */}
            <div className="w-full h-full rounded-lg overflow-hidden border border-gray-800">
              <ModernViewer
                imageUrl={getFullUrl(imageIds[currentIndex])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
