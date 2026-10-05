export const isTokenExpired = (auth) =>
  auth?.expiresAt ? new Date(auth.expiresAt).getTime() <= Date.now() : false;
