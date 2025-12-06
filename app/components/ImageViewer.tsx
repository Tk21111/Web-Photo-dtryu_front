"use client";

import { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";
import { Plus, Minus, Maximize2 } from "lucide-react";

interface ModernViewerProps {
  imageUrl: string;
}

export default function ModernViewer({ imageUrl }: ModernViewerProps) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  useEffect(() => {
    // 1. If viewer doesn't exist, create it
    if (!viewerRef.current && typeof window !== "undefined") {
      viewerRef.current = OpenSeadragon({
        id: "osd-viewer",
        prefixUrl: "", // No default icons
        showNavigationControl: false, // Hide default UI
        showNavigator: false,
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        minZoomLevel: 0.5, // Allow zooming out to see full image
        visibilityRatio: 1,
        zoomPerScroll: 1.5,
        gestureSettingsMouse: { clickToZoom: false }, // Disable click-to-zoom
        
        // IMPORTANT: Configuration for single standard images (JPG/PNG)
        tileSources: {
          type: "image",
          url: imageUrl,
        },
      });
    } 
    // 2. If viewer exists but URL changed (user clicked Next/Prev), load new image
    else if (viewerRef.current) {
      viewerRef.current.open({
        type: "image",
        url: imageUrl,
      });
    }

    // Cleanup only on unmount
    return () => {
      // We don't destroy immediately to allow smooth transitions if you add them later
      // But for strict React lifecycle:
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl]); // Re-run when imageUrl changes

  // --- Controls ---
  const zoomIn = () => viewerRef.current?.viewport.zoomBy(1.2);
  const zoomOut = () => viewerRef.current?.viewport.zoomBy(0.8);
  const resetZoom = () => viewerRef.current?.viewport.goHome();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group rounded-lg">
      {/* The Viewer Canvas */}
      <div id="osd-viewer" className="w-full h-full" />

      {/* Floating Controls (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl z-[60]">
        <button onClick={zoomOut} className="p-2 text-white hover:bg-white/20 rounded-full transition"><Minus size={20} /></button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <button onClick={resetZoom} className="p-2 text-white hover:bg-white/20 rounded-full transition"><Maximize2 size={18} /></button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <button onClick={zoomIn} className="p-2 text-white hover:bg-white/20 rounded-full transition"><Plus size={20} /></button>
      </div>
    </div>
  );
}