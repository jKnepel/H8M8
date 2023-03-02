import api from "./api";
import ROUTES from "./routes";

export interface UserCredentials {
  username: string,
  password: string
}

export interface UserAndGroupData {
  username: string,
  groups: Array<string>
}

export interface FetchTokenResponse extends UserAndGroupData {
  access: string,
  refresh: string,

}

export interface RefreshTokenResponse extends UserAndGroupData {
  access: string
}

const fetchToken = async (credentials: UserCredentials) => {
  const response = await api.post<FetchTokenResponse>(ROUTES.GET_AUTH_TOKEN, credentials);
  return response.data;
};

const verifyToken = async (token: string) => {
  const response = await api.post<UserAndGroupData>(ROUTES.VERIFY_AUTH_TOKEN, { token });
  return response.data;
};

const refreshToken = async (refreshToken: string) => {
  const response = await api.post<RefreshTokenResponse>(ROUTES.REFRESH_AUTH_TOKEN, { refresh: refreshToken });
  return response.data;
};

const AuthService = {
  fetchToken,
  verifyToken,
  refreshToken
};

export default AuthService;
