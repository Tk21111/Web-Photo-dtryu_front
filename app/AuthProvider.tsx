"use client"; // Make this a client-side component

import { SessionProvider } from "next-auth/react";
import useAuth from "./utils/useAuth";

const AuthProvider  = ({children} : {children: React.ReactNode}) => {
    useAuth();
    return <SessionProvider>{children}</SessionProvider>;
}

export default AuthProvider;