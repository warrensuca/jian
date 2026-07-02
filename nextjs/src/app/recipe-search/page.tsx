"use client";

import { space_grotesk, roboto_mono } from "@/lib/fonts";
import { useEffect, useState, useMemo } from "react";
import { FullRecipe } from "@/types";
import { fetchAllRecipes, fullRecipeToCardType } from "@/api/recipeAPI";
import RecipeCard from "@/components/ui/RecipeCard";

function RecipeSearchPage() {
  const [allRecipes, setAllRecipes] = useState<FullRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all recipes on load
  useEffect(() => {
    async function loadAllRecipes() {
      try {
        const data = await fetchAllRecipes();
        setAllRecipes(data);
      } catch (error) {
        console.error("Error fetching all recipes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllRecipes();
  }, []);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return allRecipes;

    const lowerQuery = searchQuery.toLowerCase();
    return allRecipes.filter((recipe) =>
      recipe.Name.toLowerCase().includes(lowerQuery) ||
      recipe.Ingredients_List.toLowerCase().includes(lowerQuery) ||
      recipe.Cluster_Name.toLowerCase().includes(lowerQuery)
    );
  }, [allRecipes, searchQuery]);

  return (
    <div className="flex flex-col bg-background px-[15rem]">
      <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[31.25rem] gap-[1rem]">
        <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
          TRACK 02 — RECIPE SEARCH
        </p>

        <p
          className={`text-5xl ${space_grotesk.className} font-bold text-foreground`}
        >
          Find your track.
        </p>

        <p className="text-sm text-muted-foreground text-wrap">
          Search by recipe name, ingredients, or cluster.
        </p>

        {/* Search input */}
        <div className="relative">
          <div className="flex items-center border border-[#B8B8B8] rounded-sm bg-white px-4 py-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-muted-foreground mr-3"
            >
              <path
                d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by recipe, ingredient, or cluster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="px-[2rem] pb-12">
        {loading ? (
          <p className="text-muted-foreground">Loading recipes...</p>
        ) : (
          <>
            <div className="mb-6 border-t border-[#B8B8B8] pt-4">
              <p className="text-xs text-muted-foreground">
                {filteredRecipes.length} results
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={`${recipe.Name}-${index}`}
                  {...fullRecipeToCardType(recipe)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RecipeSearchPage;
