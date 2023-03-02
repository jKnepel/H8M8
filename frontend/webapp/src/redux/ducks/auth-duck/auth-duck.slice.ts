import {createSlice} from "@reduxjs/toolkit";
import {fetchToken, hydrate} from "./auth-duck.thunks";
import {FetchState, FetchStatus} from "../../helpers";

interface AuthState extends FetchState {
  username: string | null
  hydrated: boolean,
  isHydrating: boolean,
  groups: Array<string> | null
}

const initialState: AuthState = {
  username: null,
  status: FetchStatus.IDLE,
  hydrated: false,
  isHydrating: false,
  error: null,
  groups: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /*
     * Someone may also expect a logout reducer here.
     * This is defined in our store.ts in a hacky way.
     */
  },
  extraReducers: (builder) => {
    builder.addCase(fetchToken.pending, (state) => {
      return {
        ...state,
        status: FetchStatus.LOADING,
        error: null
      };
    });
    builder.addCase(fetchToken.rejected, (state, action) => {
      return {
        ...state,
        status: FetchStatus.FAILED,
        error: action.error,
      };
    });
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      const {username, access, refresh, groups} = action.payload;

      /*
       * We store our token in the localstorage to maintain a valid authorization through e.g. page refreshes (hydrating).
       * Note: We could also do this at our service layer (see auth-service.ts) but to stay in full control
       * we should keep this in our business layer (redux).
       */
      localStorage.setItem("authToken", access);
      localStorage.setItem("refreshToken", refresh);

      return {
        ...state,
        status: FetchStatus.SUCCEEDED,
        error: null,
        username: username,
        hydrated: true,
        groups,
      };
    });
    builder.addCase(hydrate.pending, (state) => {
      return {
        ...state,
        isHydrating: true
      };
    });
    builder.addCase(hydrate.fulfilled, (state, action) => {
      const {username, groups, access} = action.payload;
      /* Note: We either receive a fresh token or the existing token (which was indeed valid) */
      const authToken = access || localStorage.getItem("authToken");
      localStorage.setItem("authToken", authToken || "");

      return {
        ...state,
        isHydrating: false,
        hydrated: true,
        username,
        groups,
        authToken
      };
    });
    builder.addCase(hydrate.rejected, (state) => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      return {
        ...state,
        username: null,
        isHydrating: false,
        hydrated: true,
        error: null,
        groups: null
      };
    });
  }
});

export default authSlice.reducer;

