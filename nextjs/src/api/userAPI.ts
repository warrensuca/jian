const AUTH_BASE_URL = "http://localhost:8000";

const authHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const authHeadersNoBody = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

// Favorites
export const getFavorites = async (token: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/favorited_recipes/`, {
    headers: authHeadersNoBody(token),
  });
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
};

export const addFavorite = async (token: string, recipeName: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/favorited_recipes/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ recipe_name: recipeName }),
  });
  if (!response.ok) throw new Error('Failed to add favorite');
  return response.json();
};

export const removeFavorite = async (token: string, recipeName: string) => {
  const response = await fetch(
    `${AUTH_BASE_URL}/favorited_recipes/by-name/${encodeURIComponent(recipeName)}`,
    {
      method: 'DELETE',
      headers: authHeadersNoBody(token),
    },
  );
  if (!response.ok && response.status !== 204)
    throw new Error('Failed to remove favorite');
};

export const checkFavorite = async (
  token: string,
  recipeName: string,
): Promise<boolean> => {
  const response = await fetch(
    `${AUTH_BASE_URL}/favorited_recipes/check/${encodeURIComponent(recipeName)}`,
    { headers: authHeadersNoBody(token) },
  );
  if (!response.ok) return false;
  const data = await response.json();
  return data.is_favorited;
};

// Interactions
export const logInteraction = async (
  token: string,
  recipeName: string,
  interactionType: string,
  recommendationSource?: string,
) => {
  const body: Record<string, string> = {
    recipe_name: recipeName,
    interaction_type: interactionType,
  };
  if (recommendationSource) body.recommendation_source = recommendationSource;

  const response = await fetch(`${AUTH_BASE_URL}/recipe_interactions/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to log interaction');
  return response.json();
};

export const getInteractions = async (token: string, limit: number = 10) => {
  const response = await fetch(
    `${AUTH_BASE_URL}/recipe_interactions/?limit=${limit}`,
    { headers: authHeadersNoBody(token) },
  );
  if (!response.ok) throw new Error('Failed to fetch interactions');
  return response.json();
};

export const getDashboardStats = async (token: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/recipe_interactions/stats`, {
    headers: authHeadersNoBody(token),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

// Ratings
export const rateRecipe = async (
  token: string,
  recipeName: string,
  rating: number,
) => {
  const response = await fetch(`${AUTH_BASE_URL}/recipe_ratings/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ recipe_name: recipeName, rating }),
  });
  if (!response.ok) throw new Error('Failed to rate recipe');
  return response.json();
};

export const getUserRating = async (
  token: string,
  recipeName: string,
): Promise<number | null> => {
  const response = await fetch(
    `${AUTH_BASE_URL}/recipe_ratings/by-name/${encodeURIComponent(recipeName)}`,
    { headers: authHeadersNoBody(token) },
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.rating;
};

export const getUserRatings = async (token: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/recipe_ratings/`, {
    headers: authHeadersNoBody(token),
  });
  if (!response.ok) throw new Error('Failed to fetch user ratings');
  return response.json();
};
