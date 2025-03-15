"use client"; // This file runs on the client

import { Provider } from "react-redux";
import { store } from "./api/redux/store";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}
