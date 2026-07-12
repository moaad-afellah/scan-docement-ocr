let accessTokenInMemory: string | null = null;

export const tokenService = {
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },

  setAccessToken(token: string | null): void {
    accessTokenInMemory = token;
  },

  clearAccessToken(): void {
    accessTokenInMemory = null;
  },
};
