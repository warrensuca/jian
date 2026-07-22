//import { Macros, RecipeRecommendation, Cluster, FullRecipe, RecipeCardType } from "@/types";
import { Macros, RecipeRecommendation, Cluster, FullRecipe, RecipeCardType } from "../types"

const BASE_URL = "https://jian-api.onrender.com";
let allRecipesCache: FullRecipe[] | null = null;
let allRecipesRequest: Promise<FullRecipe[]> | null = null;

const RATE_LIMIT_RETRY_MS = 650;

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithRateLimitRetry = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  let response = await fetch(input, init);

  // The API currently applies a 500ms, per-IP cooldown to every endpoint.
  // A single retry keeps normal navigation resilient when a previous request
  // (for example an image lookup) happened just before this one.
  if (response.status === 429) {
    await wait(RATE_LIMIT_RETRY_MS);
    response = await fetch(input, init);
  }

  return response;
};

export const getCachedAllRecipes = (): FullRecipe[] | null => allRecipesCache;

export const fetchWeightedReccomendedRecipes = async (macros: Macros) => {
  const recipe_recs: RecipeRecommendation[] = [];
  let query = "";
  //calories=200&
  for (const [name, value] of Object.entries(macros)) {
    console.log(name, value)
    if(value){
      query += `${name}=${value}&`;
    }

      
  }
  console.log(query);
  const response = await fetch(`${BASE_URL}/recommend-by-weighted_nutrition?${query}`);
  if (!response.ok) throw new Error("Failed to fetch recipes");

  const json: Array<{
    Name: string;
    Cluster: number;
    Cluster_Name: string;
    Distance: number;
  }> = await response.json();

  console.log("recipe json :", json);
  console.log("recipe json first item:", json[0]);
  console.log("recipe json first item name:", json[0]?.Name);

  for (let i = 0; i < json.length; i++) {
    const recipe: RecipeRecommendation = {
      name: json[i].Name,
      cluster: json[i].Cluster,
      clusterName: json[i].Cluster_Name,
      distance: json[i].Distance
    };
    recipe_recs.push(recipe);
  }
  return recipe_recs;
};


export const fetchFullRecipe = async (recipeName: string): Promise<FullRecipe> => {
  const normalizedName = recipeName.trim().normalize("NFKC");
  const response = await fetchWithRateLimitRetry(
    `${BASE_URL}/recipes/${encodeURIComponent(normalizedName)}`,
  );

  if (response.ok) return await response.json();

  // Recipe names are not stable path identifiers: some contain characters
  // (notably slashes) that can be decoded by a proxy before FastAPI matches
  // the route. The collection endpoint is a reliable fallback for those names.
  if (response.status === 404) {
    const recipes = await fetchAllRecipes();
    const comparableName = normalizedName.toLocaleLowerCase();
    const match = recipes.find(
      (recipe) =>
        recipe.Name.trim().normalize("NFKC").toLocaleLowerCase() ===
        comparableName,
    );

    if (match) return match;
  }

  throw new Error(
    response.status === 404
      ? "Recipe not found"
      : `Recipe service returned ${response.status}`,
  );
};

export const fetchClusters = async (): Promise<Cluster[]> => {
  const response = await fetch(`${BASE_URL}/clusters`);
  if (!response.ok) throw new Error("Failed to fetch clusters");
  return await response.json();
};

export const fetchClusterRecipes = async (clusterId: number): Promise<FullRecipe[]> => {
  const response = await fetch(`${BASE_URL}/clusters/${clusterId}`);
  if (!response.ok) throw new Error("Failed to fetch cluster recipes");
  return await response.json();
};

export const fetchAllRecipes = (): Promise<FullRecipe[]> => {
  if (allRecipesCache) return Promise.resolve(allRecipesCache);
  if (allRecipesRequest) return allRecipesRequest;

  allRecipesRequest = fetchWithRateLimitRetry(`${BASE_URL}/recipes`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Failed to fetch all recipes");

      const recipes: FullRecipe[] = await response.json();
      allRecipesCache = recipes;
      return recipes;
    })
    .finally(() => {
      allRecipesRequest = null;
    });

  return allRecipesRequest;
};

export const fullRecipeToCardType = (recipe: FullRecipe): RecipeCardType => {
  return {
    name: recipe.Name,
    macros: [
      { Cal: Number(recipe.Calories) },
      { Pro: Number(recipe.Protein) },
      { Carbs: Number(recipe.Carbohydrates) },
    ],
    clusterName: recipe.Cluster_Name,
  };
};
