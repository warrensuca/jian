const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

console.log("[AUTH API] Initialized with AUTH_BASE_URL:", AUTH_BASE_URL);

export const registerUser = async (username: string, email: string, password: string) => {
  const url = `${AUTH_BASE_URL}/auth/`;
  console.log(`[AUTH API] POST ${url} - Registering username: '${username}', email: '${email}'`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  } catch (networkError) {
    console.error("[AUTH API] Network error connecting to backend:", networkError);
    throw new Error(
      `Could not connect to FastAPI server at ${AUTH_BASE_URL}. Please ensure your backend is running on port 8000.`
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error(`[AUTH API] Registration failed with status ${response.status}:`, errorData);
    const message =
      errorData?.detail ||
      `Registration failed (Server returned HTTP ${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  const data = await response.json();
  console.log("[AUTH API] Registration successful! Received user:", data);
  return data;
};

export const loginUser = async (usernameOrEmail: string, password: string) => {
  const url = `${AUTH_BASE_URL}/auth/token`;
  console.log(`[AUTH API] POST ${url} - Attempting login for identifier: '${usernameOrEmail}'`);

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
    console.error("[AUTH API] Network error connecting to backend:", networkError);
    throw new Error(
      `Could not connect to FastAPI server at ${AUTH_BASE_URL}. Please ensure your backend is running on port 8000.`
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error(`[AUTH API] Login failed with status ${response.status}:`, errorData);
    const message =
      errorData?.detail ||
      (response.status === 401
        ? "Incorrect username/email or password"
        : `Login failed (HTTP ${response.status})`);
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  const data = await response.json();
  console.log("[AUTH API] Login successful! Received access token of length:", data.access_token?.length);
  return data; // { access_token, token_type }
};

export const getMe = async (token: string) => {
  const url = `${AUTH_BASE_URL}/auth/me`;
  console.log(`[AUTH API] GET ${url} - Verifying current session token...`);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (networkError) {
    console.error("[AUTH API] Network error verifying token at:", url, networkError);
    throw new Error(
      `Could not connect to FastAPI server at ${AUTH_BASE_URL} to verify token.`
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.warn(`[AUTH API] /auth/me rejected with status ${response.status}:`, errorData);
    throw new Error(errorData?.detail || `Session expired or invalid (HTTP ${response.status})`);
  }

  const userData = await response.json();
  console.log("[AUTH API] /auth/me profile verified successfully:", userData);
  return userData; // { id, username, email, created_at }
};
