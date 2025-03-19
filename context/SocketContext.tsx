import { createContext , useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface iSocketContext {

}

export const SocketContext =  createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({children}:{ children : React.ReactNode}) => {
    

    const [socket , setSocket] = useState<Socket | null>(null);
    const [isSocketConnected , setIsSocketConnected] = useState(false);

    console.log("isConnected >> " , isSocketConnected);
    //init a socket 
    useEffect(()=>{
        const newSocket = io();//use same server
        setSocket(newSocket);

        return () =>{
            newSocket.disconnect();
        }
    }, [])

    useEffect(()=>{
        if(socket === null){
            return
        }

        if(socket.connected){
            onConnect()
        }

        function onConnect(){
            setIsSocketConnected(true)
        }

        function onDisConnect(){
            setIsSocketConnected(false)
        }

        socket.on("connect" , onConnect);
        socket.on("disconnect" , onDisConnect);

        return ()=> {
            socket.off("connect" , onConnect)
            socket.off("disconnect" , onDisConnect)
        }
    }, [socket])
    return <SocketContext.Provider value={{}}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = () => {
    const context = useContext(SocketContext);

    if(context === null){
        throw new Error("useSocket must be used within a SocketContexProvide")
    }

    return context;
}