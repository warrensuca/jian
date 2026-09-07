const AUTH_BASE_URL = "http://localhost:8000";

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }
  return response.json();
};

export const loginUser = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await fetch(`${AUTH_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json(); // { access_token, token_type }
};

export const getMe = async (token: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Not authenticated');
  return response.json(); // { id, username, email, created_at }
};
