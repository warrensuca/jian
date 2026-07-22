import { RecipeCardType } from "../../types";
import Link from "next/link";
import { motion } from "motion/react";

function RecipeCard(props: RecipeCardType) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className="h-full"
    >
      <Link
        href={{ pathname: "/recipe", query: { name: props.name } }}
        className="block h-full"
      >
        <div className="flex h-full w-full flex-col gap-[0.5rem] rounded-[0.5rem] border border-[#B8B8B8] bg-white p-[1.25rem] shadow-[0_8px_30px_rgba(57,48,37,0.03)] transition-[background-color,border-color,box-shadow] duration-300 hover:border-[#7f9a8e] hover:bg-[#F8F6F3] hover:shadow-[0_16px_36px_rgba(57,48,37,0.08)]">
          <h3 className="text-foreground font-medium">{props.name}</h3>

          <div className="flex flex-wrap py-[0.5rem] gap-[0.375rem]">
            {props.macros.map(
              (record: Record<string, number>, index: number) => {
                const entries = Object.entries(record);
                return entries.map(([key, value]) => {
                  return (
                    <div
                      key={index}
                      className="text-xs whitespace-nowrap px-[0.5rem] py-[0.125rem] border border-px border-[#D9D2C7]"
                    >
                      <p key={`${index}-${key}`} className="text-cs">
                        [ {key}: {value} ]
                      </p>
                    </div>
                  );
                });
              },
            )}
          </div>

          <div className="border border-[#4A7865] px-[0.625rem] py-[0.25rem] rounded-full">
            <p className="text-[#4A7865] text-xs">{props.clusterName}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
export default RecipeCard;
