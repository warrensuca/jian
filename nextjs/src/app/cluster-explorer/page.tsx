"use client";

import { space_grotesk, roboto_mono } from "@/lib/fonts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cluster } from "@/types";
import { fetchClusters } from "@/api/recipeAPI";
import { motion } from "motion/react";
function ClusterCard({ cluster, index }: { cluster: Cluster; index: number }) {
  return (
    <Link href={`/cluster-explorer/${cluster.Cluster}`}>
      <div className="flex flex-col gap-4 p-6 border border-[#B8B8B8] bg-white hover:bg-[#F8F6F3] transition-colors cursor-pointer">
        <div className="flex justify-between items-start">
          <p className={`text-xs ${roboto_mono.className} text-[#4A7865]`}>
            {String(index + 1).padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">
            {cluster.Recipe_Count} recipes
          </p>
        </div>

        <div>
          <h3
            className={`text-lg ${space_grotesk.className} font-bold text-foreground`}
          >
            {cluster.Cluster_Name}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {cluster.Description}
        </p>

        <div className="flex items-center justify-between mt-2 border-t border-[#B8B8B8] pt-4">
          <p
            className={`text-xs ${space_grotesk.className} text-muted-foreground`}
          >
            Browse cluster
          </p>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-muted-foreground"
          >
            <path
              d="M3 9L9 3M9 3H4M9 3V8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function ClusterExplorer() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClusters() {
      try {
        const data = await fetchClusters();
        setClusters(data);
      } catch (error) {
        console.error("Error fetching clusters:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClusters();
  }, []);

  return (
    <div className="flex flex-col bg-background px-[15rem]">
      <div className="flex flex-col px-[2rem] py-[3.5rem] max-w-[31.25rem] gap-[1rem]">
        <p className={`text-sm ${roboto_mono.className} text-[#4A7865]`}>
          TRACK 03 — CLUSTER EXPLORER
        </p>

        <p
          className={`text-5xl ${space_grotesk.className} font-bold text-foreground`}
        >
          Six Clusters.
        </p>

        <p className="text-sm text-muted-foreground text-wrap">
          Every recipe belongs to a nutritional family. Find yours by feel or by
          function.
        </p>
      </div>

      <div className="flex flex-col gap-6 pb-12">
        {loading ? (
          <div className="px-[2rem]">
            <p className="text-muted-foreground">Loading clusters...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-[2rem]">
            {clusters.map((cluster, index) => (
              <motion.div
                key={cluster.Cluster}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >
                <ClusterCard cluster={cluster} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClusterExplorer;
