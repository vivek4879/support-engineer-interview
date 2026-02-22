type RequestWithHeaders = {
  headers?: {
    cookie?: string;
    get?: (name: string) => string | null;
  };
};

export function getCookieHeader(req: RequestWithHeaders): string {
  if (req?.headers?.cookie) {
    return req.headers.cookie;
  }

  if (req?.headers?.get) {
    return req.headers.get("cookie") || "";
  }

  return "";
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((entry) => {
        const [key, ...value] = entry.split("=");
        return [key, value.join("=")];
      })
  );
}

export function getSessionTokenFromRequest(req: RequestWithHeaders): string | undefined {
  const cookieHeader = getCookieHeader(req);
  const cookies = parseCookies(cookieHeader);
  return cookies.session;
}
