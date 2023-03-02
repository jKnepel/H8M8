export const authMiddleware = (req, res, context, fn) => {
  if (
    req.headers.get("authorization") !== "Bearer ACCESS_TOKEN_ABC" &&
    req.headers.get("authorization") !== "Bearer ACCESS_TOKEN_DEF"
  ) {
    return res(context.delay(), context.status(401));
  }

  return fn();
};
