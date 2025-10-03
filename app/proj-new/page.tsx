"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

type ProjNew = {
  _id: string;
}



export default function ProjComponent() {
    const [proj, setProj] = useState<null | ProjNew[]>(null);
    const [projImage , setProjImage] = useState<null | string[]>(null);
  useEffect(() => {
    async function fetchProj() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projnew`, {
          cache: "force-cache",
        });

        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

        const data: ProjNew[] = await res.json();

        if (data.length === 0){
            return;
        }


        for ( const d of data){
            const res = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_SERVER}/proj/image/${d._id}`, {
                cache: "force-cache",
                });
            if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

            const data = await res.json();

            if (!data || data.length === 0){
                continue;
            }
            setProjImage(data)
        }
        setProj(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProj();
  }, []); // ✅ only runs once

  return (
    <div>
      {proj ? (
            projImage?.map((val) => (
            <Image
            key={val}
            src={`${process.env.NEXT_PUBLIC_IMAGE_SERVER}/image/${val}`} // adjust to your real API/image path
            alt={`Project ${val}`}
            width={200}
            height={200}
            />
        ))
        ) : (
        "Loading..."
        )}
    </div>
  );
}
