"use client";

import { space_grotesk, roboto_mono } from "@/lib/fonts";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FullRecipe } from "@/types";
import { fetchClusterRecipes, fullRecipeToCardType } from "@/api/recipeAPI";
import RecipeCard from "@/components/ui/RecipeCard";

function ClusterDetailPage() {
  const params = useParams();
  const clusterId = Number(params.id);
  const [recipes, setRecipes] = useState<FullRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [clusterName, setClusterName] = useState("");

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await fetchClusterRecipes(clusterId);
        setRecipes(data);
        if (data.length > 0) {
          setClusterName(data[0].Cluster_Name);
        }
      } catch (error) {
        console.error("Error fetching cluster recipes:", error);
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(clusterId)) {
      loadRecipes();
    }
  }, [clusterId]);

  return (
    <div className="flex flex-col bg-background px-[15rem]">
      <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[31.25rem] gap-[1rem]">
        <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
          TRACK 03 — {clusterName.toUpperCase()}
        </p>

        <p
          className={`text-5xl ${space_grotesk.className} font-bold text-foreground`}
        >
          {clusterName}
        </p>

        <p className="text-sm text-muted-foreground text-wrap">
          {recipes.length} recipes in this cluster.
        </p>
      </div>

      <div className="px-[2rem] pb-12">
        {loading ? (
          <p className="text-muted-foreground">Loading recipes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={`${recipe.Name}-${index}`}
                {...fullRecipeToCardType(recipe)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClusterDetailPage;
