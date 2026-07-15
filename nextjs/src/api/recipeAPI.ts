//import { Macros, RecipeRecommendation, Cluster, FullRecipe, RecipeCardType } from "@/types";
import { Macros, RecipeRecommendation, Cluster, FullRecipe, RecipeCardType } from "../types"

const BASE_URL = "https://jian-api.onrender.com";
let allRecipesCache: FullRecipe[] | null = null;
let allRecipesRequest: Promise<FullRecipe[]> | null = null;

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
  const response = await fetch(`${BASE_URL}/recipes/${recipeName}`);
  if (!response.ok) throw new Error("Failed to fetch recipe");
  return await response.json();
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

  allRecipesRequest = fetch(`${BASE_URL}/recipes`)
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
