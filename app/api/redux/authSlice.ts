import { createSlice , PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface AuthState {
    accessToken : string | null;
    userId : string | null;
    roles : [string] | null;
}

const initialState : AuthState = {
    accessToken : null,
    userId : null,
    roles : null,
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        login : (state , action : PayloadAction<{accessToken : string , userId : string , roles : [string]}>) => {
            state.accessToken = action.payload.accessToken;
            state.userId = action.payload.userId;  
            state.roles = action.payload.roles 
        },
        logout : (state) => {
            state.accessToken = null;
            state.userId = null;
            state.roles = null;
        }
    }
})

export const {login , logout} = authSlice.actions;
export const selectCurrentToken = (state : RootState) => state.auth.accessToken
export const selectUserId = (state : RootState) => state.auth.userId
export const selectRoles = (state : RootState) => state.auth.roles
export default authSlice.reducer;
