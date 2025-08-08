const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

export const getExpireAt = (expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000;
  return expiresAt - TOKEN_EXPIRY_BUFFER_MS;
};
