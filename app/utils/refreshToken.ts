import { store } from "../api/redux/store"; // Import store to dispatch actions
import { login } from "../api/redux/authSlice"; // Import action to set access token

export const refreshAccessToken = async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    if (!refreshToken) {
        console.log("No refresh token found.");
        return null;
    }

    try {
        // Make API request to refresh token endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/user`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to refresh access token");
        }
        
        if (data.accessToken) {
            // Save the new access token to Redux and localStorage
            store.dispatch(login({accessToken : data.accessToken , userId : data.userId , roles : data.roles})); // Save to Redux
        }

        return data.accessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return null;
    }
};
