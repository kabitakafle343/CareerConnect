import Cookies from "js-cookie";

export interface TokenDetails {
  access: string;
}

export interface TokenInfo {
  is_valid?: boolean;
  exp: number;

  name?: string;
  email?: string;
  role?: "admin" | "employer" | "candidate";
}

function setToken(token: TokenDetails) {
  Cookies.set("token", token.access);
}

function getToken(): TokenDetails | null {
  try {
    const access = Cookies.get("token");

    if (!access) {
      return null;
    }

    return {
      access,
    };
  } catch (e) {
    return null;
  }
}

function getTokenDetails(): TokenInfo | null {
  try {
    const token = getToken();

    if (!token) {
      return null;
    }

    const payload = token.access.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(
      window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as TokenInfo;
  } catch (e) {
    return null;
  }
}

function isAuthenticated() {
  const tokenDetails = getTokenDetails();

  if (tokenDetails) {
    return tokenDetails.exp * 1000 > Date.now();
  }

  return false;
}

function clearToken() {
  Cookies.remove("token");
}

export const getRole = () => {
  return getTokenDetails();
};

export const getUsername = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.access.split(".")[1];

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    return decoded.name || null;
  } catch {
    return null;
  }
};

const TokenService = {
  setToken,
  getUsername,
  getToken,
  getTokenDetails,
  isAuthenticated,
  clearToken,
};

export default TokenService;
