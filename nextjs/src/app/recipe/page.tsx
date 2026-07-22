"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RecipeDetail from "../../components/ui/RecipeDetail";
import ResultLoading from "../../components/ui/ResultLoading";

function RecipeFromQuery() {
  const searchParams = useSearchParams();
  return <RecipeDetail recipeName={searchParams.get("name") ?? ""} />;
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
          <ResultLoading label="Loading recipe..." />
        </main>
      }
    >
      <RecipeFromQuery />
    </Suspense>
  );
}
