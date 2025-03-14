"use client"

import { useEffect } from "react"

export default function Error({err} : {err : Error}) {
    useEffect(()=>{
        console.log(err)
    } , [err])

    return(
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl text-red-500"> error fetching for users data</div>
        </div>
    )
};