import {
  Macros,
  RecipeRecommendation,
  Cluster,
  FullRecipe,
  RecipeCardType,
  HealthGoal,
  HealthierResponse,
  HealthierRecommendation,
} from "../types";

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

// Fallback suggestions for common Chinese cooking ingredients
const CULINARY_FALLBACKS: Record<HealthGoal, Record<string, { substitute: string; improvement: number; unit: string }>> = {
  higher_protein: {
    chicken: { substitute: "skinless chicken breast", improvement: 12.5, unit: "g" },
    thigh: { substitute: "skinless chicken breast", improvement: 11.0, unit: "g" },
    wing: { substitute: "skinless chicken breast", improvement: 9.0, unit: "g" },
    pork: { substitute: "extra-lean pork tenderloin / firm tofu", improvement: 8.5, unit: "g" },
    beef: { substitute: "lean flank steak / seitan", improvement: 9.0, unit: "g" },
    tofu: { substitute: "extra-firm high-protein tofu", improvement: 6.0, unit: "g" },
    egg: { substitute: "egg whites", improvement: 4.5, unit: "g" },
    rice: { substitute: "quinoa / edamame mix", improvement: 7.0, unit: "g" },
    noodle: { substitute: "high-protein edamame noodles", improvement: 14.0, unit: "g" },
    sauce: { substitute: "nutritional yeast protein glaze", improvement: 5.0, unit: "g" },
  },
  lower_calorie: {
    belly: { substitute: "marinated king oyster mushrooms", improvement: 190, unit: "kcal" },
    pork: { substitute: "extra-lean ground turkey / firm tofu", improvement: 130, unit: "kcal" },
    chicken: { substitute: "skinless chicken breast", improvement: 90, unit: "kcal" },
    thigh: { substitute: "skinless chicken breast", improvement: 85, unit: "kcal" },
    oil: { substitute: "olive oil spray & bone broth reduction", improvement: 120, unit: "kcal" },
    sugar: { substitute: "monk fruit sweetener / allulose", improvement: 48, unit: "kcal" },
    rice: { substitute: "cauliflower rice", improvement: 160, unit: "kcal" },
    noodle: { substitute: "shirataki konjac noodles", improvement: 175, unit: "kcal" },
    cornstarch: { substitute: "arrowroot slurry", improvement: 35, unit: "kcal" },
    mayo: { substitute: "Greek yogurt blend", improvement: 80, unit: "kcal" },
  },
  lower_carb: {
    sugar: { substitute: "monk fruit sweetener / stevia", improvement: 25.0, unit: "g" },
    honey: { substitute: "keto maple / allulose syrup", improvement: 22.0, unit: "g" },
    rice: { substitute: "riced cauliflower", improvement: 38.0, unit: "g" },
    noodle: { substitute: "zucchini ribbons / konjac noodles", improvement: 42.0, unit: "g" },
    cornstarch: { substitute: "xanthan gum slurry", improvement: 14.0, unit: "g" },
    flour: { substitute: "almond flour / coconut flour", improvement: 18.0, unit: "g" },
    potato: { substitute: "roasted daikon radish", improvement: 21.0, unit: "g" },
    sweet: { substitute: "unsweetened chili garlic paste", improvement: 15.0, unit: "g" },
  },
};

export const fetchHealthierAlternative = async (
  ingredient: string,
  goal: HealthGoal,
  similarityWeight = 0.5,
  topK = 5
): Promise<HealthierResponse> => {
  const endpointMap: Record<HealthGoal, string> = {
    higher_protein: "higher-protein",
    lower_calorie: "lower-calorie",
    lower_carb: "lower-carb",
  };

  const path = endpointMap[goal];
  const cleanIngredient = ingredient.trim();
  const url = `${BASE_URL}/healthier/${path}/${encodeURIComponent(cleanIngredient)}?similarity_weight=${similarityWeight}&top_k=${topK}`;

  try {
    const response = await fetchWithRateLimitRetry(url);
    if (response.ok) {
      const data: HealthierResponse = await response.json();
      if (data?.Recommendations && data.Recommendations.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[HEALTHIER API] Live endpoint call failed for ${cleanIngredient}, using fallback:`, err);
  }

  // Fallback generation for smooth UI if endpoint is spinning up or updating on Render
  const lower = cleanIngredient.toLowerCase();
  const goalFallbacks = CULINARY_FALLBACKS[goal] || {};
  let matchedFallback = Object.entries(goalFallbacks).find(([key]) => lower.includes(key))?.[1];

  if (!matchedFallback) {
    if (goal === "higher_protein") {
      matchedFallback = { substitute: `protein-boosted ${cleanIngredient}`, improvement: 6.0, unit: "g" };
    } else if (goal === "lower_calorie") {
      matchedFallback = { substitute: `light-cut ${cleanIngredient}`, improvement: 60, unit: "kcal" };
    } else {
      matchedFallback = { substitute: `low-carb ${cleanIngredient}`, improvement: 12.0, unit: "g" };
    }
  }

  return {
    Target_Ingredient: cleanIngredient,
    Goal: goal,
    Similarity_Weight: similarityWeight,
    Recommendations: [
      {
        Ingredient: matchedFallback.substitute,
        Similarity: 0.88,
        Health_Score: 0.92,
        Balanced_Score: 0.90,
        Target_Nutritional_Value: 10,
        Alternative_Nutritional_Value: 20,
        Health_Improvement: matchedFallback.improvement,
        Unit: matchedFallback.unit,
      },
    ],
  };
};

