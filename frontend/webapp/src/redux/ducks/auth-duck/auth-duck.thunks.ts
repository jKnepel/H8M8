import {createAsyncThunk} from "@reduxjs/toolkit";
import AuthService, {FetchTokenResponse, UserAndGroupData, UserCredentials} from "../../../api/auth-service";
import {AppDispatch, AppState} from "../../store";

export const fetchToken = createAsyncThunk<FetchTokenResponse, UserCredentials, {
  state: AppState,
  dispatch: AppDispatch
}>("AUTH/FETCH_TOKEN", async (credentials) => AuthService.fetchToken(credentials));

/**
 * The hydrate thunk is used so maintain a valid authorization through e.g. page refreshes.
 * If the user was not logged in before (we have nether an authToken nor refreshToken) we can skip this.
 * If an authToken and refreshToken are available, we first check if the authToken is still valid.
 * If it's valid, the user is logged in, if not, we try to refresh the authToken.
 * If this also fails, the user is logged out or the validity of the refreshToken has expired (after 24h).
 */
export const hydrate = createAsyncThunk<
  UserAndGroupData & { access?: string },
  void,
  {
    state: AppState,
    dispatch: AppDispatch,
    rejectValue: null
  }>("AUTH/HYDRATE", async (_: void, thunkAPI) => {
    const authToken = localStorage.getItem("authToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!authToken || !refreshToken) return thunkAPI.rejectWithValue(null);
    try {
      return await AuthService.verifyToken(authToken);
    } catch (e) {
      try {
        return await AuthService.refreshToken(refreshToken);
      } catch (e) {
        return thunkAPI.rejectWithValue(null);
      }
    }
  });
