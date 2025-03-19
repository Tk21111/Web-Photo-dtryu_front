"use client"

import { SocketContextProvider } from "./SocketContext"

const SocketProvider = ({children}: {children : React.ReactNode}) => {
    return (
        <SocketContextProvider>{children}</SocketContextProvider>
    )
}

export default SocketProvider;