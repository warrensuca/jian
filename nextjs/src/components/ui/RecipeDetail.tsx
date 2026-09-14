"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRecipeImage } from "../../api/imageAPI";
import {
  fetchFullRecipe,
  fetchHealthierAlternative,
} from "../../api/recipeAPI";
import {
  checkFavorite,
  addFavorite,
  removeFavorite,
  logInteraction,
  getUserRating,
  rateRecipe,
} from "../../api/userAPI";
import { roboto_mono, space_grotesk } from "../../lib/fonts";
import {
  FullRecipe,
  RecipeImage,
  HealthGoal,
  SubstitutedIngredient,
} from "../../types";
import { AuthContext } from "../../app/context/AuthContext";
import ResultLoading from "./ResultLoading";
import {
  Heart,
  Star,
  CaretDown,
  ArrowCounterClockwise,
  Check,
  X,
  Sparkle,
} from "@phosphor-icons/react";

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const parseProcedure = (value: string | null | undefined): string[] => {
  if (!value) return [];

  for (const candidate of [value, value.replace(/'/g, '"')]) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((step) => step.trim()).filter(Boolean);
      }
    } catch {
      // Scraped rows are not consistently JSON; use text fallback below.
    }
  }

  return value
    .replace(/^\[|\]$/g, "")
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((step) => step.replace(/^['"\s]+|['"\s]+$/g, "").trim())
    .filter(Boolean);
};

const parseCommaList = (value: string | null | undefined): string[] => {
  if (!value) return [];
  for (const candidate of [value, value.replace(/'/g, '"')]) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      // Scraped rows are not consistently JSON
    }
  }
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => item.replace(/^['"\s]+|['"\s]+$/g, "").trim())
    .filter(Boolean);
};

const cleanIngredientQuery = (str: string): string => {
  return str
    .replace(/\(.*?\)/g, "")
    .replace(/^[\d\s\/½¼¾⅓⅔⅛.,-]+/g, "")
    .replace(
      /^(cups?|tbsp|tsp|tablespoons?|teaspoons?|pounds?|lbs?|oz|ounces?|grams?|g|kg|cloves?|slices?|pinch|pieces?|bunch)\s+/i,
      ""
    )
    .replace(/^of\s+/i, "")
    .trim();
};

export default function RecipeDetail({ recipeName }: { recipeName: string }) {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<RecipeImage | null>(null);
  const [loading, setLoading] = useState(() => Boolean(recipeName.trim()));
  const [error, setError] = useState<string | null>(null);

  // Favorite + Rating state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Healthier substitution state
  const [substitutedMap, setSubstitutedMap] = useState<
    Record<number, SubstitutedIngredient>
  >({});
  const [isSubmittingHealthier, setIsSubmittingHealthier] = useState(false);

  // UI Method 1: Arc Browser-style multi-select
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [arcGoal, setArcGoal] = useState<HealthGoal>("higher_protein");

  // UI Method 2: "Healthier" dropdown button & color-coded checkboxes
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeDropdownGoal, setActiveDropdownGoal] =
    useState<HealthGoal | null>(null);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    let isCurrent = true;

    async function loadRecipe() {
      setLoading(true);
      setRecipe(null);
      setRecipeImage(null);
      setError(null);
      setSubstitutedMap({});
      setSelectedIndices(new Set());
      setCheckedIndices(new Set());
      setActiveDropdownGoal(null);

      try {
        const recipeData = await fetchFullRecipe(recipeName);
        if (!isCurrent) return;
        setRecipe(recipeData);
        setLoading(false);

        // Log VIEW interaction if logged in
        if (auth?.token) {
          logInteraction(auth.token, recipeData.Name, "VIEW").catch(() => {});
        }

        await delay(650);
        const imageData = await fetchRecipeImage(recipeData.Name).catch(
          () => null
        );
        if (isCurrent) setRecipeImage(imageData);
      } catch (loadError) {
        if (!isCurrent) return;
        console.error("Error fetching recipe:", loadError);
        setError(
          loadError instanceof Error && loadError.message === "Recipe not found"
            ? "We couldn't find that recipe."
            : "The kitchen is taking a little longer than usual. Please try again."
        );
        setLoading(false);
      }
    }

    if (recipeName.trim()) void loadRecipe();

    return () => {
      isCurrent = false;
    };
  }, [recipeName, auth?.token]);

  // Check favorite + rating state when recipe loads
  useEffect(() => {
    if (!recipe || !auth?.token) return;

    checkFavorite(auth.token, recipe.Name)
      .then(setIsFavorited)
      .catch(() => {});

    getUserRating(auth.token, recipe.Name)
      .then(setUserRating)
      .catch(() => {});
  }, [recipe, auth?.token]);

  const handleFavoriteToggle = async () => {
    if (!auth?.token) {
      router.push("/login");
      return;
    }
    if (!recipe || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(auth.token, recipe.Name);
        setIsFavorited(false);
        logInteraction(auth.token, recipe.Name, "UNFAVORITE").catch(() => {});
      } else {
        await addFavorite(auth.token, recipe.Name);
        setIsFavorited(true);
        logInteraction(auth.token, recipe.Name, "FAVORITE").catch(() => {});
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!auth?.token) {
      router.push("/login");
      return;
    }
    if (!recipe || ratingLoading) return;

    setRatingLoading(true);
    try {
      await rateRecipe(auth.token, recipe.Name, rating);
      setUserRating(rating);
      logInteraction(auth.token, recipe.Name, "RATING").catch(() => {});
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setRatingLoading(false);
    }
  };

  const procedure = useMemo(
    () => parseProcedure(recipe?.Procedure),
    [recipe?.Procedure]
  );
  const ingredients = useMemo(
    () => parseCommaList(recipe?.Ingredients_List),
    [recipe?.Ingredients_List]
  );
  const ingredientNames = useMemo(
    () => parseCommaList(recipe?.Ingredients_Names),
    [recipe?.Ingredients_Names]
  );
  const tags = useMemo(() => parseCommaList(recipe?.Tags), [recipe?.Tags]);

  // Handle Arc-style item selection (Cmd+click or click when dock active)
  const handleIngredientClick = (index: number, e: React.MouseEvent) => {
    // If in checkbox dropdown mode, click toggles checkbox
    if (activeDropdownGoal) {
      toggleCheckbox(index);
      return;
    }

    // If Cmd/Ctrl key is held or if Arc selection dock is already active
    if (e.metaKey || e.ctrlKey || selectedIndices.size > 0) {
      e.preventDefault();
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    }
  };

  const toggleCheckbox = (index: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Perform substitution API calls for given indices and goal
  const executeSubstitutions = async (
    targetIndices: number[],
    goal: HealthGoal
  ) => {
    if (targetIndices.length === 0) return;
    setIsSubmittingHealthier(true);

    try {
      const results = await Promise.all(
        targetIndices.map(async (index) => {
          const original = ingredients[index];
          const query =
            ingredientNames[index] ||
            cleanIngredientQuery(original) ||
            original;

          const res = await fetchHealthierAlternative(query, goal);
          const topRec = res?.Recommendations?.[0];

          if (topRec) {
            return {
              index,
              substitution: {
                originalText: original,
                substitutedText: topRec.Ingredient,
                substituteName: topRec.Ingredient,
                goal,
                improvement: topRec.Health_Improvement,
                unit: topRec.Unit,
              },
            };
          }
          return null;
        })
      );

      setSubstitutedMap((prev) => {
        const updated = { ...prev };
        for (const item of results) {
          if (item) {
            updated[item.index] = item.substitution;
          }
        }
        return updated;
      });

      // Clear selections
      setSelectedIndices(new Set());
      setCheckedIndices(new Set());
      setActiveDropdownGoal(null);
    } catch (err) {
      console.error("Healthier substitution failed:", err);
    } finally {
      setIsSubmittingHealthier(false);
    }
  };

  const handleRevert = (index: number) => {
    setSubstitutedMap((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleResetAllSubstitutions = () => {
    setSubstitutedMap({});
    setSelectedIndices(new Set());
    setCheckedIndices(new Set());
    setActiveDropdownGoal(null);
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <ResultLoading label="Loading recipe..." />
      </main>
    );
  }

  if (!recipe || error) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-start justify-center gap-5 px-5 py-14 sm:px-8">
        <p className={`${roboto_mono.className} text-xs text-[#4A7865]`}>
          KITCHEN NOTE
        </p>
        <h1 className={`${space_grotesk.className} text-3xl font-bold`}>
          {error ??
            (recipeName.trim()
              ? "We couldn't find that recipe."
              : "No recipe was selected.")}
        </h1>
        <Link
          href="/recipe-search"
          className="rounded-full bg-[#315c4b] px-5 py-2.5 text-sm text-white transition-transform hover:-translate-y-0.5"
        >
          Browse all recipes
        </Link>
      </main>
    );
  }

  const servingMatch = recipe.Nutrition_Facts?.match(/\d+(?:\.\d+)?/);
  const substitutedCount = Object.keys(substitutedMap).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      {/* Header */}
      <header className="mb-10 max-w-3xl">
        <p
          className={`${roboto_mono.className} mb-4 text-xs tracking-[0.12em] text-[#4A7865]`}
        >
          TRACK 04 — RECIPE DETAIL
        </p>
        <h1
          className={`${space_grotesk.className} text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl`}
        >
          {recipe.Name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-[#4A7865]/60 bg-[#e9eee8] px-3 py-1 text-xs text-[#315c4b]">
            {recipe.Cluster_Name}
          </span>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9c1b5] px-3 py-1 text-xs transition-all hover:border-[#e07a7a] disabled:opacity-50"
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={14}
              weight={isFavorited ? "fill" : "regular"}
              className={isFavorited ? "text-red-400" : "text-muted-foreground"}
            />
            <span className="text-muted-foreground">
              {isFavorited ? "Saved" : "Save"}
            </span>
          </button>
        </div>

        {/* Star rating */}
        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              disabled={ratingLoading}
              className="transition-transform hover:scale-110 disabled:opacity-50"
              title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                size={20}
                weight={
                  userRating !== null && star <= userRating ? "fill" : "regular"
                }
                className={
                  userRating !== null && star <= userRating
                    ? "text-[#d4943e]"
                    : "text-[#c9c1b5] hover:text-[#d4943e]"
                }
              />
            </button>
          ))}
          {userRating !== null && (
            <span className="ml-2 text-xs text-muted-foreground">
              Your rating: {userRating}/5
            </span>
          )}
          {!auth?.user && (
            <span className="ml-2 text-xs text-muted-foreground">
              <Link href="/login" className="text-[#4A7865] hover:underline">
                Sign in
              </Link>{" "}
              to rate
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          {/* At a Glance */}
          <section className="rounded-xl border border-[#c9c1b5] bg-white/80 p-6 shadow-[0_18px_60px_rgba(58,48,36,0.05)]">
            <p className={`${roboto_mono.className} text-xs text-[#8c5d2f]`}>
              AT A GLANCE
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Servings", recipe.Servings || servingMatch?.[0] || "—"],
                ["Prep", recipe.Prep_Time || "—"],
                ["Cook", recipe.Cook_Time || "—"],
                ["Calories", `${recipe.Calories} kcal`],
              ].map(([label, value]) => (
                <div key={label} className="border-l border-[#d8d0c4] pl-3">
                  <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="relative rounded-xl border border-[#c9c1b5] bg-white/80 p-6 sm:p-8">
            {/* Section Header with "Healthier" Dropdown & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2ddd4] pb-4">
              <div className="flex items-center gap-3">
                <h2 className={`${space_grotesk.className} text-2xl font-bold`}>
                  Ingredients
                </h2>
                {substitutedCount > 0 && (
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-xs font-medium text-[#234235] border border-[#a9c1b3]">
                    {substitutedCount} substituted
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Reset all button if anything was replaced */}
                {substitutedCount > 0 && (
                  <button
                    onClick={handleResetAllSubstitutions}
                    className="inline-flex items-center gap-1 rounded-full border border-[#c9c1b5] px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowCounterClockwise size={12} />
                    Reset all
                  </button>
                )}

                {/* UI Method 2: "Healthier" Button with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#c9c1b5] bg-white px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-[#315c4b] hover:shadow-sm"
                  >
                    <Sparkle size={14} weight="bold" className="text-[#315c4b]" />
                    <span>Healthier</span>
                    <CaretDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu (Muted Red, Yellow, Green — No Emojis) */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-[#c9c1b5] bg-white p-1.5 shadow-xl">
                      <div className="px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        Select goal
                      </div>

                      {/* Higher Protein: Muted Green */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdownGoal("higher_protein");
                          setIsDropdownOpen(false);
                          setSelectedIndices(new Set());
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-foreground transition-colors hover:bg-[#eef4f0]"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#315c4b]" />
                        <span className="font-medium">Higher Protein</span>
                      </button>

                      {/* Lower Calorie: Muted Yellow */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdownGoal("lower_calorie");
                          setIsDropdownOpen(false);
                          setSelectedIndices(new Set());
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-foreground transition-colors hover:bg-[#faf5eb]"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#c48b28]" />
                        <span className="font-medium">Lower Calorie</span>
                      </button>

                      {/* Lower Carb: Muted Red */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdownGoal("lower_carb");
                          setIsDropdownOpen(false);
                          setSelectedIndices(new Set());
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-foreground transition-colors hover:bg-[#fbf2f1]"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#b95c50]" />
                        <span className="font-medium">Lower Carb</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instruction helper tag */}
            <div className="mt-3 flex items-center justify-between text-[0.72rem] text-muted-foreground">
              <span>
                {activeDropdownGoal
                  ? "Check ingredients below to substitute"
                  : "Tip: Cmd + click any ingredient to select"}
              </span>
              {selectedIndices.size > 0 && !activeDropdownGoal && (
                <span className="font-medium text-[#315c4b]">
                  {selectedIndices.size} selected
                </span>
              )}
            </div>

            {/* UI Method 2: Active Checkbox Batch Action Strip */}
            {activeDropdownGoal && (
              <div
                className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-xs ${
                  activeDropdownGoal === "higher_protein"
                    ? "border-[#a9c1b3] bg-[#eef4f0]"
                    : activeDropdownGoal === "lower_calorie"
                    ? "border-[#dec08b] bg-[#faf5eb]"
                    : "border-[#dfa59d] bg-[#fbf2f1]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      activeDropdownGoal === "higher_protein"
                        ? "bg-[#315c4b]"
                        : activeDropdownGoal === "lower_calorie"
                        ? "bg-[#c48b28]"
                        : "bg-[#b95c50]"
                    }`}
                  />
                  <span className="font-semibold text-foreground">
                    {activeDropdownGoal === "higher_protein"
                      ? "Higher Protein Mode"
                      : activeDropdownGoal === "lower_calorie"
                      ? "Lower Calorie Mode"
                      : "Lower Carb Mode"}
                  </span>
                  <span className="text-muted-foreground">
                    ({checkedIndices.size} of {ingredients.length} checked)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (checkedIndices.size === ingredients.length) {
                        setCheckedIndices(new Set());
                      } else {
                        setCheckedIndices(
                          new Set(ingredients.map((_, i) => i))
                        );
                      }
                    }}
                    className="rounded-lg border border-[#c9c1b5] bg-white px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-[#F4F1EB]"
                  >
                    {checkedIndices.size === ingredients.length
                      ? "Uncheck all"
                      : "Check all"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      checkedIndices.size === 0 || isSubmittingHealthier
                    }
                    onClick={() =>
                      executeSubstitutions(
                        Array.from(checkedIndices),
                        activeDropdownGoal
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium text-white transition-all disabled:opacity-50 ${
                      activeDropdownGoal === "higher_protein"
                        ? "bg-[#315c4b] hover:bg-[#284e3f]"
                        : activeDropdownGoal === "lower_calorie"
                        ? "bg-[#c48b28] hover:bg-[#a6741e]"
                        : "bg-[#b95c50] hover:bg-[#99473c]"
                    }`}
                  >
                    {isSubmittingHealthier ? (
                      "Finding substitutes..."
                    ) : (
                      <>
                        <Check size={14} weight="bold" />
                        <span>Submit ({checkedIndices.size})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdownGoal(null);
                      setCheckedIndices(new Set());
                    }}
                    className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
                    title="Exit mode"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Ingredients Grid / List */}
            <div className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {ingredients.map((ingredient, index) => {
                const sub = substitutedMap[index];
                const isSelected = selectedIndices.has(index);
                const isChecked = checkedIndices.has(index);

                // Determine row background & border based on state
                let cardStyle =
                  "border-[#e2ddd4] bg-transparent hover:bg-[#F4F1EB]/70";

                if (isSelected) {
                  cardStyle =
                    "border-[#315c4b] bg-[#eef4f0] shadow-sm ring-1 ring-[#315c4b]/30";
                } else if (sub) {
                  cardStyle =
                    sub.goal === "higher_protein"
                      ? "border-[#a9c1b3] bg-[#eef4f0]/60"
                      : sub.goal === "lower_calorie"
                      ? "border-[#dec08b] bg-[#faf5eb]/60"
                      : "border-[#dfa59d] bg-[#fbf2f1]/60";
                }

                return (
                  <div
                    key={`${ingredient}-${index}`}
                    onClick={(e) => handleIngredientClick(index, e)}
                    className={`group relative flex items-start gap-3 rounded-xl border p-3 text-sm transition-all duration-150 select-none cursor-pointer ${cardStyle}`}
                  >
                    {/* UI Method 2: Color-Coded Checkbox when dropdown mode active */}
                    {activeDropdownGoal ? (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(index)}
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-1 h-4 w-4 rounded transition-colors ${
                          activeDropdownGoal === "higher_protein"
                            ? "accent-[#315c4b]"
                            : activeDropdownGoal === "lower_calorie"
                            ? "accent-[#c48b28]"
                            : "accent-[#b95c50]"
                        }`}
                      />
                    ) : (
                      /* Default bullet indicator or selection indicator */
                      <span
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-colors ${
                          isSelected
                            ? "bg-[#315c4b] ring-2 ring-[#315c4b]/40"
                            : sub
                            ? sub.goal === "higher_protein"
                              ? "bg-[#315c4b]"
                              : sub.goal === "lower_calorie"
                              ? "bg-[#c48b28]"
                              : "bg-[#b95c50]"
                            : "bg-[#d4943e]"
                        }`}
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 leading-relaxed">
                      {sub ? (
                        /* Substituted view */
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground line-through">
                              {sub.originalText}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevert(index);
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-[#c9c1b5] bg-white px-2 py-0.5 text-[0.68rem] text-muted-foreground transition-colors hover:text-foreground hover:border-[#315c4b]"
                              title="Revert to original"
                            >
                              <ArrowCounterClockwise size={11} />
                              <span>Undo</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {sub.substitutedText}
                            </span>

                            {/* Nutritional Improvement Badge (Muted Red, Yellow, Green) */}
                            <span
                              className={`rounded-md px-2 py-0.5 text-[0.68rem] font-medium border ${
                                sub.goal === "higher_protein"
                                  ? "bg-[#eef4f0] text-[#234235] border-[#a9c1b3]"
                                  : sub.goal === "lower_calorie"
                                  ? "bg-[#faf5eb] text-[#785112] border-[#dec08b]"
                                  : "bg-[#fbf2f1] text-[#7a2b22] border-[#dfa59d]"
                              }`}
                            >
                              {sub.goal === "higher_protein" &&
                                `+${sub.improvement}${sub.unit} protein`}
                              {sub.goal === "lower_calorie" &&
                                `-${sub.improvement}${sub.unit}`}
                              {sub.goal === "lower_carb" &&
                                `-${sub.improvement}${sub.unit} carbs`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Original view */
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground">{ingredient}</span>
                          {isSelected && (
                            <span className="rounded-full bg-[#315c4b] px-1.5 py-0.5 text-[0.62rem] font-medium text-white">
                              Selected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Method / Procedure */}
          <section className="rounded-xl border border-[#c9c1b5] bg-white/80 p-6 sm:p-8">
            <h2 className={`${space_grotesk.className} text-2xl font-bold`}>
              Method
            </h2>
            <ol className="mt-7 space-y-7">
              {procedure.map((step, index) => (
                <li
                  key={`${index}-${step.slice(0, 20)}`}
                  className="grid grid-cols-[2.4rem_1fr] gap-4"
                >
                  <span
                    className={`${roboto_mono.className} flex h-9 w-9 items-center justify-center rounded-full border border-[#9eaa9f] text-xs text-[#315c4b]`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-[#45423e]">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {recipeImage && (
            <figure className="overflow-hidden rounded-xl border border-[#c9c1b5] bg-white p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e7e1d8]">
                <Image
                  src={recipeImage.url}
                  alt={recipe.Name}
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption
                className={`${roboto_mono.className} mt-3 text-[0.65rem] text-muted-foreground`}
              >
                SOURCE — {recipeImage.source}
              </figcaption>
            </figure>
          )}

          <section className="rounded-xl bg-[#284e3f] p-6 text-[#f7f1e7]">
            <p className={`${roboto_mono.className} text-xs text-[#d9af70]`}>
              NUTRITION / SERVING
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Calories", `${recipe.Calories} kcal`],
                ["Protein", `${recipe.Protein}g`],
                ["Carbohydrates", `${recipe.Carbohydrates}g`],
                ["Fat", `${recipe.Fat}g`],
                ["Saturated fat", `${recipe.Saturated_Fat}g`],
                ["Sodium", `${Number(recipe.Sodium) * 1000}mg`],
                ["Sugar", `${recipe.Sugar}g`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/15 pb-3"
                >
                  <dt className="text-white/65">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {tags.length > 0 && (
            <section className="rounded-xl border border-[#c9c1b5] bg-white/70 p-6">
              <h2 className={`${space_grotesk.className} font-bold`}>Tags</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#bdb5aa] px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* UI Method 1: Arc Browser-style Floating Action Panel (Dock) */}
      {selectedIndices.size > 0 && !activeDropdownGoal && (
        <div className="fixed bottom-6 left-1/2 z-40 w-[94vw] max-w-xl -translate-x-1/2 rounded-2xl border border-[#c9c1b5] bg-[#f4f1eb]/95 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            {/* Top row: Counter & Dismiss */}
            <div className="flex items-center justify-between border-b border-[#e2ddd4] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#315c4b] px-2 py-0.5 text-xs font-semibold text-white">
                  {selectedIndices.size} selected
                </span>
                <span className="text-muted-foreground">
                  Choose substitution goal:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndices(new Set())}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-[#e2ddd4] hover:text-foreground"
                title="Deselect all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Middle row: 3 Goal Tabs (Muted Red, Yellow, Green — No Emojis) */}
            <div className="grid grid-cols-3 gap-2">
              {/* Higher Protein: Muted Green */}
              <button
                type="button"
                onClick={() => setArcGoal("higher_protein")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                  arcGoal === "higher_protein"
                    ? "border-[#315c4b] bg-[#315c4b] text-white shadow-sm"
                    : "border-[#a9c1b3] bg-[#eef4f0] text-[#234235] hover:bg-[#e2ede5]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    arcGoal === "higher_protein" ? "bg-white" : "bg-[#315c4b]"
                  }`}
                />
                <span>Higher Protein</span>
              </button>

              {/* Lower Calorie: Muted Yellow */}
              <button
                type="button"
                onClick={() => setArcGoal("lower_calorie")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                  arcGoal === "lower_calorie"
                    ? "border-[#c48b28] bg-[#c48b28] text-white shadow-sm"
                    : "border-[#dec08b] bg-[#faf5eb] text-[#785112] hover:bg-[#f3ead4]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    arcGoal === "lower_calorie" ? "bg-white" : "bg-[#c48b28]"
                  }`}
                />
                <span>Lower Calorie</span>
              </button>

              {/* Lower Carb: Muted Red */}
              <button
                type="button"
                onClick={() => setArcGoal("lower_carb")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                  arcGoal === "lower_carb"
                    ? "border-[#b95c50] bg-[#b95c50] text-white shadow-sm"
                    : "border-[#dfa59d] bg-[#fbf2f1] text-[#7a2b22] hover:bg-[#f5e3e1]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    arcGoal === "lower_carb" ? "bg-white" : "bg-[#b95c50]"
                  }`}
                />
                <span>Lower Carb</span>
              </button>
            </div>

            {/* Bottom row: Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedIndices(new Set())}
                className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmittingHealthier}
                onClick={() =>
                  executeSubstitutions(Array.from(selectedIndices), arcGoal)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#315c4b] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#284e3f] disabled:opacity-60"
              >
                {isSubmittingHealthier ? (
                  <span>Finding substitutes...</span>
                ) : (
                  <>
                    <Check size={14} weight="bold" />
                    <span>Apply Substitutions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
