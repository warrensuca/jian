"use client";

import { space_grotesk, roboto_mono } from "../../../lib/fonts";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FullRecipe } from "../../../types";
import { fetchFullRecipe } from "../../../api/recipeAPI";

function RecipeDetailPage() {
  const params = useParams();
  const recipeName = decodeURIComponent(params.name as string);
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const data = await fetchFullRecipe(recipeName);
        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    }
    if (recipeName) {
      loadRecipe();
      
    }
  }, [recipeName]);

  return (
    <div className="flex flex-col bg-background px-[20rem]">
      {loading ? (
        <div className="flex flex-col px-[2rem] py-[3.5rem]">
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      ) : recipe ? (
          <>
            {console.log(recipe.Ingredients_List)}
            <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[40rem] gap-[1.5rem]">
              <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
                TRACK 04 — RECIPE DETAIL
              </p>

              <h1
                className={`text-4xl ${space_grotesk.className} font-bold text-foreground`}
              >
                {recipe.Name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="border border-[#4A7865] px-3 py-1 rounded-full">
                  <p className="text-[#4A7865] text-xs">
                    {recipe.Cluster_Name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-[2rem] pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col gap-8">
                {/* Quick info */}
                <div className="bg-white border border-[#B8B8B8] p-6">
                  <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                    
                    {`Servings: ${recipe.Nutrition_Facts.split(',')[0].match(/\d+/g)?.[0]}`}
                  </h3>
                  
                </div>

                {/* Ingredients */}
                <div className="bg-white border border-[#B8B8B8] p-6">
                  <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                    Ingredients
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    
                    {recipe.Ingredients_List.split(",").map((ingredient, idx) => (
                      <p key={idx} className="mb-1">{ingredient.trim()}</p>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white border border-[#B8B8B8] p-6">
                  <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                    Procedure
                  </h3>
                  <div className="flex flex-col gap-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    
                    {JSON.parse(recipe.Procedure.replace(/'/g, '"')).map((step: string, idx: number) => (
                      
                      <span key={idx} className="mb-1 my-5">
                        {`${idx+1}: ${step.trim()} \n`}
                        
                        
                        </span> 

                    ))}
                    
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col gap-6">
                {/* Nutrition */}
                <div className="bg-white border border-[#B8B8B8] p-6">
                  <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                    Nutrition
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Calories</span>
                      <span>{recipe.Calories} kcal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Protein</span>
                      <span>{recipe.Protein}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carbohydrates</span>
                      <span>{recipe.Carbohydrates}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fat</span>
                      <span>{recipe.Fat}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saturated Fat</span>
                      <span>{recipe.Saturated_Fat}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sodium</span>
                      <span>{(recipe.Sodium as number )* 1000}mg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sugar</span>
                      <span>{recipe.Sugar}g</span>
                    </div>
                  </div>
                </div>

                {recipe.Tags && (
                  <div className="bg-white border border-[#B8B8B8] p-6">
                    <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.Tags.split(",").map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 border border-[#B8B8B8] rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipe.Source && (
                  <div className="bg-white border border-[#B8B8B8] p-6">
                  <h3 className={`text-lg ${space_grotesk.className} font-bold mb-4`}>
                    Source
                  </h3>
                  <p className="text-sm text-muted-foreground">{recipe.Source}</p>
                </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col px-[2rem] py-[3.5rem]">
            <p className="text-muted-foreground">Recipe not found.</p>
          </div>
        )}
    </div>
  );
}

export default RecipeDetailPage;
