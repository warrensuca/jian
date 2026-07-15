"use client";

import { space_grotesk, roboto_mono } from "../../lib/fonts";
import { useEffect, useState, useMemo } from "react";
import { FullRecipe } from "../../types";
import {
  fetchAllRecipes,
  fullRecipeToCardType,
  getCachedAllRecipes,
} from "../../api/recipeAPI";
import { motion } from "motion/react";
import RecipeCard from "../../components/ui/RecipeCard";
import ResultLoading from "../../components/ui/ResultLoading";

const SEARCH_TAGS = [
  "chinese",
  "korean",
  "japanese",
  "thai",
  "chicken",
  "beef",
  "pork",
  "rice",
  "noodle",
  "spicy",
  "sweet",
  "kimchi",
];

const getSearchTerms = (query: string) =>
  query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((term) => term.trim())
    .filter(Boolean);

function RecipeSearchPage() {
  const [allRecipes, setAllRecipes] = useState<FullRecipe[]>(
    () => getCachedAllRecipes() ?? [],
  );
  const [loading, setLoading] = useState(
    () => getCachedAllRecipes() === null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(24);

  const selectedTags = useMemo(
    () => new Set(getSearchTerms(searchQuery)),
    [searchQuery],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDisplayLimit(24);
  };

  const handleTagClick = (tag: string) => {
    const searchTerms = getSearchTerms(searchQuery);
    const nextTerms = selectedTags.has(tag)
      ? searchTerms.filter((term) => term !== tag)
      : [...searchTerms, tag];

    setSearchQuery(nextTerms.join(" "));
    setDisplayLimit(24);
  };

  // Fetch all recipes on load
  useEffect(() => {
    if (getCachedAllRecipes()) return;

    let isCurrent = true;

    async function loadAllRecipes() {
      try {
        const data = await fetchAllRecipes();
        if (isCurrent) setAllRecipes(data);
      } catch (error) {
        console.error("Error fetching all recipes:", error);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    void loadAllRecipes();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return allRecipes;

    const searchTerms = getSearchTerms(searchQuery);
    if (!searchTerms.length) return allRecipes;

    return allRecipes.filter((recipe) => {
      const searchableRecipe = [
        recipe.Name,
        recipe.Ingredients_List,
        recipe.Cluster_Name,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.every((term) => searchableRecipe.includes(term));
    });
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2 pt-1"
          aria-label="Featured search tags"
        >
          {SEARCH_TAGS.map((tag) => {
            const isSelected = selectedTags.has(tag);

            return (
              <button
                key={tag}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Remove" : "Add"} ${tag} search tag`}
                onClick={() => handleTagClick(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isSelected
                    ? "border-[#4A7865] bg-[#4A7865] text-white"
                    : "border-[#B8B8B8] bg-white text-foreground hover:bg-[#F8F6F3] hover:text-[#4A7865]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-[2rem] pb-12">
        {loading ? (
          <ResultLoading label="Loading recipes..." />
        ) : (
          <>
            <div className="mb-6 border-t border-[#B8B8B8] pt-4">
              <p className="text-xs text-muted-foreground">
                {filteredRecipes.length} results
              </p>
            </div>

            {/* 1. Added grid classes directly to the motion container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.slice(0, displayLimit).map((recipe, index) => (
                <motion.div
                  key={`${recipe.Name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                >
                  <RecipeCard {...fullRecipeToCardType(recipe)} />
                </motion.div>
              ))}
            </div>

            {filteredRecipes.length > displayLimit && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 24)}
                  className={`px-6 py-2 border border-[#B8B8B8] hover:bg-[#F8F6F3] transition-colors text-sm font-medium ${space_grotesk.className}`}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RecipeSearchPage;
