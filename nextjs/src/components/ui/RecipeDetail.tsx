"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchRecipeImage } from "../../api/imageAPI";
import { fetchFullRecipe } from "../../api/recipeAPI";
import { roboto_mono, space_grotesk } from "../../lib/fonts";
import { FullRecipe, RecipeImage } from "../../types";
import ResultLoading from "./ResultLoading";

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
      // Scraped rows are not consistently JSON; use a text fallback below.
    }
  }

  return value
    .replace(/^\[|\]$/g, "")
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((step) => step.replace(/^['"\s]+|['"\s]+$/g, "").trim())
    .filter(Boolean);
};

const parseCommaList = (value: string | null | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function RecipeDetail({ recipeName }: { recipeName: string }) {
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<RecipeImage | null>(null);
  const [loading, setLoading] = useState(() => Boolean(recipeName.trim()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadRecipe() {
      setLoading(true);
      setRecipe(null);
      setRecipeImage(null);
      setError(null);

      try {
        // The API rate-limits requests by IP. Always secure the required recipe
        // first, then leave the optional image request outside its cooldown.
        const recipeData = await fetchFullRecipe(recipeName);
        if (!isCurrent) return;
        setRecipe(recipeData);
        setLoading(false);

        await delay(650);
        const imageData = await fetchRecipeImage(recipeData.Name).catch(() => null);
        if (isCurrent) setRecipeImage(imageData);
      } catch (loadError) {
        if (!isCurrent) return;
        console.error("Error fetching recipe:", loadError);
        setError(
          loadError instanceof Error && loadError.message === "Recipe not found"
            ? "We couldn’t find that recipe."
            : "The kitchen is taking a little longer than usual. Please try again.",
        );
        setLoading(false);
      }
    }

    if (recipeName.trim()) void loadRecipe();

    return () => {
      isCurrent = false;
    };
  }, [recipeName]);

  const procedure = useMemo(
    () => parseProcedure(recipe?.Procedure),
    [recipe?.Procedure],
  );
  const ingredients = useMemo(
    () => parseCommaList(recipe?.Ingredients_List),
    [recipe?.Ingredients_List],
  );
  const tags = useMemo(() => parseCommaList(recipe?.Tags), [recipe?.Tags]);

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
              ? "We couldn’t find that recipe."
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

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <header className="mb-10 max-w-3xl">
        <p className={`${roboto_mono.className} mb-4 text-xs tracking-[0.12em] text-[#4A7865]`}>
          TRACK 04 — RECIPE DETAIL
        </p>
        <h1 className={`${space_grotesk.className} text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl`}>
          {recipe.Name}
        </h1>
        <div className="mt-5 inline-flex rounded-full border border-[#4A7865]/60 bg-[#e9eee8] px-3 py-1 text-xs text-[#315c4b]">
          {recipe.Cluster_Name}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-[#c9c1b5] bg-white/80 p-6 shadow-[0_18px_60px_rgba(58,48,36,0.05)]">
            <p className={`${roboto_mono.className} text-xs text-[#8c5d2f]`}>AT A GLANCE</p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Servings", recipe.Servings || servingMatch?.[0] || "—"],
                ["Prep", recipe.Prep_Time || "—"],
                ["Cook", recipe.Cook_Time || "—"],
                ["Calories", `${recipe.Calories} kcal`],
              ].map(([label, value]) => (
                <div key={label} className="border-l border-[#d8d0c4] pl-3">
                  <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#c9c1b5] bg-white/80 p-6 sm:p-8">
            <h2 className={`${space_grotesk.className} text-2xl font-bold`}>Ingredients</h2>
            <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {ingredients.map((ingredient, index) => (
                <div key={`${ingredient}-${index}`} className="flex gap-3 border-b border-[#e2ddd4] pb-3 text-sm leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4943e]" />
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#c9c1b5] bg-white/80 p-6 sm:p-8">
            <h2 className={`${space_grotesk.className} text-2xl font-bold`}>Method</h2>
            <ol className="mt-7 space-y-7">
              {procedure.map((step, index) => (
                <li key={`${index}-${step.slice(0, 20)}`} className="grid grid-cols-[2.4rem_1fr] gap-4">
                  <span className={`${roboto_mono.className} flex h-9 w-9 items-center justify-center rounded-full border border-[#9eaa9f] text-xs text-[#315c4b]`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-[#45423e]">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {recipeImage && (
            <figure className="overflow-hidden rounded-xl border border-[#c9c1b5] bg-white p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e7e1d8]">
                <Image src={recipeImage.url} alt={recipe.Name} fill sizes="(min-width: 1024px) 28vw, 100vw" className="object-cover" />
              </div>
              <figcaption className={`${roboto_mono.className} mt-3 text-[0.65rem] text-muted-foreground`}>
                SOURCE — {recipeImage.source}
              </figcaption>
            </figure>
          )}

          <section className="rounded-xl bg-[#284e3f] p-6 text-[#f7f1e7]">
            <p className={`${roboto_mono.className} text-xs text-[#d9af70]`}>NUTRITION / SERVING</p>
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
                <div key={label} className="flex justify-between gap-4 border-b border-white/15 pb-3">
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
                  <span key={tag} className="rounded-full border border-[#bdb5aa] px-3 py-1 text-xs">{tag}</span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
