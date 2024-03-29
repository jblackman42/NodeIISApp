const { serialize, parse } = require("cookie");


const TOKEN_NAME = "token";

const MAX_AGE = 60 * 60 * 8; // 8 hours

const setTokenCookie = (res, token) => {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", cookie);
}

const removeTokenCookie = (res) => {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

const parseCookies = (req) => {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}

const getTokenCookie = (req) => {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

module.exports = {
  setTokenCookie,
  getTokenCookie,
  removeTokenCookie,
  parseCookies,
  MAX_AGE
}