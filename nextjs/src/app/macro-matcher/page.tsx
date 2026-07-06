"use client";

import RecipeCard from "../../components/ui/RecipeCard";
import { Slider } from "@/components/shadcn/slider";
import { Button } from "@/components/shadcn/button";
import { space_grotesk, space_mono, roboto_mono } from "@/lib/fonts";
import Link from "next/link";
import { useState, useRef } from "react";
import { Macros, RecipeCardType, RecipeRecommendation } from "@/types";
import {
  fetchWeightedReccomendedRecipes,
  fetchFullRecipe,
} from "@/api/recipeAPI";
import sleep from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

function MacroMatcher() {
  const [calories, setCalories] = useState([200]);
  const [protein, setProtein] = useState([20]);
  const [carbs, setCarbs] = useState([40]);
  const [fat, setFat] = useState([20]);
  const [satFat, setSatFat] = useState([10]);
  const [sodium, setSodium] = useState([500]);
  const [sugar, setSugar] = useState([20]);

  const [cluster, setCluster] = useState("Not Submitted");
  const [matchedRecipes, setMatchedRecipes] = useState<RecipeCardType[]>([]);
  const submitted = useRef<Boolean>(false);
  const [submitKey, setSubmitKey] = useState(0);

  const nameToNum: {
    [key: string]: number;
    "Light Sides & Soups": number;
    "Rich Meat Mains": number;
    "Deserts & Sweets": number;
    "Balanced Carb-Mains": number;
    "Low-Carb Proteins": number;
  } = {
    "Light Sides & Soups": 0,
    "Rich Meat Mains": 1,
    "Deserts & Sweets": 2,
    "Balanced Carb-Mains": 3,
    "Low-Carb Proteins": 4,
  };

  const nameToDescription: {
  [key: string]: string;
  "Light Sides & Soups": string;
  "Rich Meat Mains": string;
  "Desserts & Sweets": string;
  "Balanced Carb-Mains": string;
  "Low-Carb Proteins": string;
} = {
  "Light Sides & Soups":
    "Light, nourishing dishes with lower calories and sodium. Great for recovery meals, lighter lunches, or days when you want to stay fueled without feeling weighed down.",

  "Rich Meat Mains":
    "Hearty, protein-rich entrées centered around beef, pork, or other flavorful meats. Ideal for post-workout recovery/fuel, bulking phases, or satisfying high-energy meals.",

  "Desserts & Sweets":
    "Sweet treats and pastries that prioritize flavor over performance nutrition. Perfect for celebrations, cheat meals, or enjoying Chinese desserts in moderation.",

  "Balanced Carb-Mains":
    "Well-rounded rice and noodle dishes that provide a balanced mix of carbohydrates, protein, and fats. Excellent everyday meals for sustained energy and athletic performance.",

  "Low-Carb Proteins":
    "Lean, protein-forward dishes with fewer carbohydrates. Best suited for high-protein diets, cutting phases, or anyone looking to maximize protein intake while keeping calories in check.",
};
  const blurVariants = {
    hidden: { opacity: 0, filter: "blur(10px)", scale: 0.98 },
    visible: { opacity: 1, filter: "blur(0px)", scale: 1 },
  };
  return (
    <div className="flex flex-col items-start bg-background w-full px-[15rem] border">
      <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[31.25rem] h-[17.0625rem] gap-[1rem]">
        <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
          TRACK 01 — MACRO MATCHER
        </p>

        <p
          className={`text-5xl ${space_grotesk.className} font-bold text-foreground`}
        >
          Fuel Your Flow.
        </p>

        <p className="text-sm text-muted-foreground text-wrap">
          Dial your macros. We surface the cluster that fits your fuel profile —
          then you pick the track.
        </p>
      </div>

      <div className="flex justify-evenly w-full max-w-7xl mx-auto ">
        <div className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] border border-l-0 border-solid border-[#B8B8B8] ">
          <p className="text-sm text-muted-foreground">CONTROL PANEL</p>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Calories</p>
              <p className="text-xs text-accent">{`${calories}kcals`}</p>
            </div>

            <Slider
              value={calories}
              onValueChange={(newValue) => setCalories(newValue)}
              max={1000}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Protein</p>
              <p className="text-xs text-accent">{`${protein}g`}</p>
            </div>

            <Slider
              value={protein}
              onValueChange={(newValue) => setProtein(newValue)}
              max={100}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Carbohydrates</p>
              <p className="text-xs text-accent">{`${carbs}g`}</p>
            </div>

            <Slider
              value={carbs}
              onValueChange={(newValue) => setCarbs(newValue)}
              max={200}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Fat</p>
              <p className="text-xs text-accent">{`${fat}g`}</p>
            </div>

            <Slider
              value={fat}
              onValueChange={(newValue) => setFat(newValue)}
              max={100}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Saturated Fat</p>
              <p className="text-xs text-accent">{`${satFat}g`}</p>
            </div>

            <Slider
              value={satFat}
              onValueChange={(newValue) => setSatFat(newValue)}
              max={50}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Sodium</p>
              <p className="text-xs text-accent">{`${sodium}mg`}</p>
            </div>

            <Slider
              value={sodium}
              onValueChange={(newValue) => setSodium(newValue)}
              max={2500}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-xs text-foreground">Sugar</p>
              <p className="text-xs text-accent">{`${sugar}g`}</p>
            </div>

            <Slider
              value={sugar}
              onValueChange={(newValue) => setSugar(newValue)}
              max={100}
              step={1}
            />

            <motion.button
              type="submit"
              className="bg-transparent border border-solid border-muted-foreground hover:bg-[#4A7865]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={async () => {
                submitted.current = true;

                console.log("here");
                const macros: Macros = {
                  calories: calories[0],
                  protein: protein[0],
                  carbohydrates: carbs[0],
                  fat: fat[0],
                  saturated_fat: satFat[0],
                  sodium: sodium[0] / 1000,
                  sugar: sugar[0],
                };
                const recipes: RecipeRecommendation[] =
                  await fetchWeightedReccomendedRecipes(macros);
                const fetchedRecipes: RecipeCardType[] = [];
                await new Promise((resolve) => setTimeout(resolve, 600));
                for (const r of recipes.slice(0, 3)) {
                  {
                    await new Promise((resolve) => setTimeout(resolve, 600));
                  }
                  try {
                    const recipeData = await fetchFullRecipe(r.name);

                    fetchedRecipes.push({
                      name: recipeData.Name,
                      macros: [
                        { Cal: Number(recipeData.Calories) },
                        { Pro: Number(recipeData.Protein) },
                        { Carbs: Number(recipeData.Carbohydrates) },
                      ] as Record<string, number>[],
                      clusterName: recipeData.Cluster_Name,
                    });

                    // stagger requests to avoid 429 Rate Limits
                  } catch (error) {
                    console.error("Error fetching individual recipe:", error);
                  }
                }

                // find nearest cluster
                let counts: Record<string, number> = {
                  "Light Sides & Soups": 0,
                  "Rich Meat Mains": 0,
                  "Desserts & Sweets": 0,
                  "Balanced Carb-Mains": 0,
                  "Low-Carb Proteins": 0,
                };
                for (const r of recipes) {
                  counts[r.clusterName] = (counts[r.clusterName] || 0) + 1;
                }

                console.log(counts);
                setCluster(
                  Object.keys(counts).reduce((a, b) =>
                    counts[a] > counts[b] ? a : b,
                  ),
                );
                // update state once with all the new recipes added to the existing ones
                setMatchedRecipes(fetchedRecipes);
                setSubmitKey((prev) => prev + 1);
              }}
            >
              Submit
            </motion.button>
          </div>
        </div>
        <motion.div
          layout
          className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] border-l-0 border-r-0 border-solid border-[#B8B8B8] border-1"
        >
          <p className="text-sm text-muted-foreground">CLUSTER REVEAL</p>

          {/* mode="wait" ensures the exit animation finishes before the enter animation starts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={submitKey}
              variants={blurVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col gap-[1rem]"
            >
              <div className="flex flex-col gap-[1rem] p-[1.5rem] border-solid border-[#B8B8B8] rounded-[0.25rem] border-1">
                <p
                  className={`text-sm ${roboto_mono.className} text-[#4A7865]`}
                >
                  MATCHED TO CLUSTER
                </p>

                <p
                  className={`text-3xl ${space_grotesk.className} font-bold ${cluster === "Not Submitted" ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {cluster}
                </p>

                <p className="text-sm text-muted-foreground text-wrap">
                  {nameToDescription[cluster]}
                </p>
              </div>

              {cluster !== "Not Submitted" && (
                <div className="flex flex-col gap-[1rem] px-[1rem] py-[0.75rem] border-solid border-[#B8B8B8] rounded-[0.25rem] border-1">
                  <Link href={`/cluster-explorer/${nameToNum[cluster]}`}>
                    <p
                      className={`text-sm text-muted-foreground ${space_grotesk.className} font-medium`}
                    >
                      {`Browse all in ${cluster}`}
                    </p>
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        {submitted && (
          <motion.div
            key={`recipes-${submitKey}`} // Forces re-render on submit
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={blurVariants}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-[1rem] py-[2rem]"
          >
            {matchedRecipes.map((recipe) => (
              <RecipeCard key={recipe.name} {...recipe} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MacroMatcher;
