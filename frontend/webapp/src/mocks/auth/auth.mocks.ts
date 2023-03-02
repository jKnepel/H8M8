import { rest } from "msw";
import { FetchTokenResponse, RefreshTokenResponse, UserAndGroupData } from "../../api/auth-service";
import ROUTES from "../../api/routes";
import authData from "./auth.json";

export const authMocks = [
  rest.post<FetchTokenResponse>(ROUTES.GET_AUTH_TOKEN, async (req, res, context) => {
    const { username, password } = await req.json<{ username: string, password: string }>();

    if (username !== "admin" || password !== "admin") return res(context.status(401), context.delay(2000));

    return res(context.status(200), context.delay(), context.json(authData));
  }),
  rest.post<UserAndGroupData>(ROUTES.VERIFY_AUTH_TOKEN, async (req, res, context) => {
    const { token } = await req.json<{ token: string }>();

    if (token !== "ACCESS_TOKEN_ABC" && token !== "ACCESS_TOKEN_DEF") return res(context.status(401), context.delay());

    const { username, groups } = authData;
    return res(context.status(200), context.delay(), context.json({ username, groups }));
  }),
  rest.post<RefreshTokenResponse>(ROUTES.REFRESH_AUTH_TOKEN, async (req, res, context) => {
    const { refresh } = await req.json<{ refresh: string }>();

    if (refresh !== "REFRESH_TOKEN_ABC") return res(context.status(401), context.delay());

    const { username, groups } = authData;
    return res(context.status(200), context.delay(), context.json({ username, groups, access: "ACCESS_TOKEN_DEF" }));
  })
];
