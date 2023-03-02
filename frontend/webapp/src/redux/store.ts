import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {useDispatch,} from "react-redux";
import authDuckSlice from "./ducks/auth-duck/auth-duck.slice";

const appReducer = combineReducers({
  auth: authDuckSlice,
});

/* Little hack, we clear the store after logout to achieve an empty state */
const rootReducer = (state, action) => {
  if (action.type === "AUTH/SIGN_OUT") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};


const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: true,
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export default store;
