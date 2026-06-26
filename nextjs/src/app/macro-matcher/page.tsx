import Divider from "../../components/ui/Divider";
import RecipeCard from "../../components/ui/RecipeCard";
import { Slider } from "@/components/shadcn/slider";
import { Button } from "@/components/shadcn/button";
import { space_grotesk, space_mono, roboto_mono } from "@/lib/fonts";
import Link from "next/link";
import { useState, useRef } from "react";
import { Macros, RecipeCardType, RecipeRecommendation } from "@/types";
import { fetchReccomendedRecipes, fetchRecipe } from "@/api/recipeAPI";
import sleep from "@/lib/utils";

function MacroMatcher() {
  const [calories, setCalories] = useState([200]);
  const [protein, setProtein] = useState([20]);
  const [carbs, setCarbs] = useState([40]);
  const [fat, setFat] = useState([20]);
  const [satFat, setSatFat] = useState([10]);
  const [sodium, setSodium] = useState([500]);
  const [sugar, setSugar] = useState([20]);

  const [cluster, setCluster] = useState("Not Found");
  const [matchedRecipes, setMatchedRecipes] = useState<RecipeCardType[]>([]);
  const submitted = useRef<Boolean>(false);
  return (
    <div className="flex flex-col bg-background w-[80rem] px-[20rem]">
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

      <div className="flex justify-evenly w-[62rem] ">
        <div className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] border border-l-0 border-solid border-[#B8B8B8] border-1">
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
            
            <Button
              type="submit"
              className="bg-transparent border-px border-muted-foreground hover:bg-[#4A7865]"
              onClick={async () => {
                
                submitted.current = true;
                console.log("here");
                const macros: Macros = {
                  calories: calories[0],
                  protein: protein[0],
                  carbohydrates: carbs[0],
                  fat: fat[0],
                  saturated_fat: satFat[0],
                  sodium: sodium[0],
                  sugar: sugar[0],
                };
                const recipes: RecipeRecommendation[] =
                  await fetchReccomendedRecipes(macros);
                const fetchedRecipes: RecipeCardType[] = [];
                await new Promise((resolve) => setTimeout(resolve, 600));
                for (const r of recipes.slice(0, 3)) {
                  {await new Promise(resolve => setTimeout(resolve, 600))}
                  try {
                    const recipe = await fetchRecipe(r.name);
                    const recipeData = await recipe.json();

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
                    'Light Sides & Soups' : 0,
                    'Rich Meat Mains': 0,
                    'Desserts & Sweets': 0,
                    'Balanced Carb-Mains': 0,
                    'Low-Carb Proteins': 0
                }
                for (const r of recipes){
                  counts[r.clusterName] = (counts[r.clusterName] || 0) + 1;
                }

                console.log(counts)
                setCluster(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b))
                // update state once with all the new recipes added to the existing ones
                setMatchedRecipes(fetchedRecipes);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col px-[0.5rem] gap-[2rem] px-[2rem] py-[2.5rem] rounded-border border-l-0 border-r-0 border-solid border-[#B8B8B8] border-1">
          <p className="text-sm text-muted-foreground">CLUSTER REVEAL</p>
          <div className="flex flex-col gap-[1rem] p-[1.5rem] border-solid border-[#B8B8B8] rounded-[0.25rem] border-1">
            <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
              MATCHED TO CLUSTER
            </p>

            <p
              className={`text-3xl ${space_grotesk.className} font-bold text-foreground`}
            >
              {cluster}
            </p>

            <p className="text-sm text-muted-foreground text-wrap">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus
              odio molestiae saepe tenetur dignissimos deleniti optio sapiente
              minus blanditiis reiciendis.
            </p>
          </div>

          <div className="flex flex-col gap-[1rem] px-[1rem] py-[0.75rem] border-solid border-[#B8B8B8] rounded-[0.25rem] border-1">
            <Link href="/">
              <p
                className={`text-sm text-muted-foreground ${space_grotesk.className} font-medium`}
              >
                {`Browse all in `}
              </p>
            </Link>
          </div>
        </div>
      </div>
      {submitted && (
        <div className="flex gap-4 py-[2rem]">
          {matchedRecipes.map((recipe: RecipeCardType) => {
            
            return <RecipeCard key={recipe.name} {...recipe} />;
          })}
        </div>
      )}
      <div></div>
    </div>
  );
}

export default MacroMatcher;
