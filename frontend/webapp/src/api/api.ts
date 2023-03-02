import axios from "axios";
import ENVIRONMENT from "../utils/env";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import AuthService from "./auth-service";
import store from "../redux/store";
import { showNotification } from "@mantine/notifications";
import moment from "moment";

const withToken = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    function (config) {
      config.headers["Authorization"] = "Bearer " + (localStorage.getItem("authToken") || "");
      return config;
    },
  );
};

const withLogging = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    function (config) {
      return config;
    },
  );
  axiosInstance.interceptors.response.use(
    function (response) {
      return response;
    },
  );
};

const api = axios.create({
  baseURL: ENVIRONMENT.BACKEND_URL,
});

const refreshAuthLogic = async (failedRequest) => {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  try {
    const { access } = await AuthService.refreshToken(refreshToken);
    localStorage.setItem("authToken", access);
    failedRequest.response.config.headers["Authorization"] = "Bearer " + access;
    return Promise.resolve();
  } catch (e) {
    store.dispatch({ type: "AUTH/LOGOUT" });
    return Promise.reject(e);
  }
};

api.interceptors.response.use(null, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  const isPermissionError = error?.response?.status === 401;
  if(!isPermissionError) {
    showNotification({
      id: `error-notification-${error?.config?.url}-${moment().valueOf()}`,
      disallowClose: false,
      autoClose: 6000,
      title: "Error",
      message: `${error?.name}: ${error?.message}`,
      color: "red",
      //icon: <ExclamationMark size={ 18} />,
    });
  }
  return Promise.reject(error);
});

createAuthRefreshInterceptor(api, refreshAuthLogic, {
  shouldRefresh: () => store.getState().auth.hydrated && !!store.getState().auth.username
});

if (ENVIRONMENT.LOCATION === "development") {
  if (window) {
    (window as Window)["api"] = api;
  }
  withLogging(axios);
  withLogging(api);
}

withToken(api);

export default api;


