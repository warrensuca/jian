export interface Macros {
  calories: number | null;
  carbohydrates: number | null;
  protein: number | null;
  fat: number | null;
  saturated_fat: number | null;
  sodium: number | null;
  sugar: number | null;
}

export interface RecipeRecommendation {
  name: string;
  cluster: number;
  clusterName: string;
  distance: number;
}

export interface RecipeCardType {
  name: string;
  macros: Record<string, number>[];
  clusterName: string;
}

export interface Cluster {
  Cluster: number;
  Cluster_Name: string;
  Recipe_Count: number;
  Description: string;
}

export interface FullRecipe {
  Name: string;
  Cluster: number;
  Cluster_Name: string;
  Calories: string | number;
  Protein: string | number;
  Carbohydrates: string | number;
  Fat: string | number;
  Saturated_Fat: string | number;
  Sodium: string | number;
  Sugar: string | number;
  Nutrition_Facts: string;
  Ingredients_List: string;
  Procedure: string;
  Servings: string | number;
  Prep_Time: string | number;
  Cook_Time: string | number;
  Tags: string;
  Source: string;
}

export interface RecipeImage {
  url: string;
  source: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface FavoritedRecipe {
  id: number;
  user_id: number;
  recipe_name: string;
  created_at: string;
}

export type InteractionType = 'VIEW' | 'CLICK' | 'FAVORITE' | 'UNFAVORITE' | 'COOKED' | 'RATING';
export type RecommendationSource = 'KNN' | 'NUTRITION' | 'CLUSTER' | 'SEARCH' | 'HOME';

export interface RecipeInteraction {
  id: number;
  user_id: number;
  recipe_name: string;
  interaction_type: InteractionType;
  recommendation_source: RecommendationSource | null;
  created_at: string;
}

export interface UserRecipeRating {
  id: number;
  user_id: number;
  recipe_name: string;
  rating: number;
  created_at: string;
}

export interface DashboardStats {
  total_views: number;
  total_favorites: number;
  total_ratings: number;
  recent_recipes: { recipe_name: string; interaction_type: string; created_at: string }[];
}
