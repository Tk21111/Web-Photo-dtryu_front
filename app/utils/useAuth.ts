"use client"
import { useEffect } from "react"
import { refreshAccessToken } from "./refreshToken"

const useAuth = ()=>{
    useEffect(()=> {
        const getAccessToken = async () => {
            await refreshAccessToken();
        }

        getAccessToken();
    } , []);
}

export default useAuth;