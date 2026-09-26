const RAW_AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://jian-auth-api.vercel.app";

const AUTH_BASE_URL = RAW_AUTH_URL.replace(/\/+$/, "");

export const registerUser = async (username: string, email: string, password: string) => {
  const url = `${AUTH_BASE_URL}/auth/`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  } catch (networkError) {
    console.error("[AUTH API] Network error during registration:", networkError);
    throw new Error(
      "Unable to connect to the authentication service. Please check your internet connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error(`[AUTH API] Registration failed with status ${response.status}:`, errorData);
    const message =
      errorData?.detail ||
      "Registration failed. Please check your details and try again.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  const data = await response.json();
  return data;
};

export const loginUser = async (usernameOrEmail: string, password: string) => {
  const url = `${AUTH_BASE_URL}/auth/token`;

  const formData = new URLSearchParams();
  formData.append("username", usernameOrEmail);
  formData.append("password", password);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
  } catch (networkError) {
    console.error("[AUTH API] Network error during login:", networkError);
    throw new Error(
      "Unable to connect to the authentication service. Please check your internet connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error(`[AUTH API] Login failed with status ${response.status}:`, errorData);
    const message =
      errorData?.detail ||
      (response.status === 401
        ? "Incorrect username/email or password."
        : "Sign in failed. Please check your credentials.");
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  const data = await response.json();
  return data; // { access_token, token_type }
};

export const getMe = async (token: string) => {
  const url = `${AUTH_BASE_URL}/auth/me`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (networkError) {
    console.error("[AUTH API] Network error verifying token:", networkError);
    throw new Error(
      "Unable to verify authentication session. Please sign in again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.warn(`[AUTH API] /auth/me rejected with status ${response.status}:`, errorData);
    throw new Error(errorData?.detail || "Session expired or invalid.");
  }

  const userData = await response.json();
  return userData; // { id, username, email, created_at }
};

