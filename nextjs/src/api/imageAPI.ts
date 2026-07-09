import { RecipeImage } from "../types";

const BASE_URL = "https://chinese-recipe-api.vercel.app";

export const fetchRecipeImage = async (
  recipeName: string,
): Promise<RecipeImage | null> => {
  const encodedRecipeName = encodeURIComponent(recipeName);
  const response = await fetch(
    `${BASE_URL}/images/${encodedRecipeName}`,
  );
  console.log(`${BASE_URL}/images/${encodedRecipeName}`,)
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch recipe image");
  }

  return await response.json();
};
