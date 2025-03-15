import { createSlice , PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface AuthState {
    accessToken : string | null;

}

const initialState : AuthState = {
    accessToken : null
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        login : (state , action : PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        logout : (state) => {
            state.accessToken = null;
        }
    }
})

export const {login , logout} = authSlice.actions;
export const selectCurrentToken = (state : RootState) => state.auth.accessToken
export default authSlice.reducer;
