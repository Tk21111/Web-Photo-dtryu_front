"use client"
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/app/api/redux/authSlice";
import { useRouter } from "next/navigation"; // ✅ Use next/navigation for App Router


export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [pwd, setPwd] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const dispatch = useDispatch();
    const router = useRouter();

    interface LoginResponse {
        accessToken?: string;
        refreshToken?: string;
        message?: string;
        userId : string;
        roles : [string];
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user: username, pwd : pwd }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            if (data.accessToken) {
                dispatch(login({accessToken : data.accessToken , userId : data.userId , roles : data.roles})); // Store token in Redux
                
                router.push("/projs"); // Redirect user to dashboard
            }

            if(data.refreshToken) {
                localStorage.setItem("refreshToken" , data.refreshToken);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Username</label>
                <input 
                    type="text" 
                    required 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                
                <label>Password</label>
                <input 
                    type="password" 
                    required 
                    value={pwd} 
                    onChange={(e) => setPwd(e.target.value)} 
                />
                
                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>
        </div>
    );
}
