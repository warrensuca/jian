"use client";

import { useParams } from "next/navigation";
import RecipeDetail from "../../../components/ui/RecipeDetail";

export default function LegacyRecipeDetailPage() {
  const params = useParams<{ name: string }>();
  return <RecipeDetail recipeName={params.name ?? ""} />;
}
