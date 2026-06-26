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
