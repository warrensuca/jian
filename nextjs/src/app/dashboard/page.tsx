"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { roboto_mono, space_grotesk } from "../../lib/fonts";
import {
  getFavorites,
  getDashboardStats,
  removeFavorite,
} from "../../api/userAPI";
import { fetchFullRecipe, fullRecipeToCardType } from "../../api/recipeAPI";
import RecipeCard from "../../components/ui/RecipeCard";
import ResultLoading from "../../components/ui/ResultLoading";
import {
  SignOut,
  Heart,
  Eye,
  Star,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import type {
  FavoritedRecipe,
  DashboardStats,
  RecipeCardType,
} from "../../types";

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoritedRecipe[]>([]);
  const [favoriteCards, setFavoriteCards] = useState<RecipeCardType[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [favData, statsData] = await Promise.all([
          getFavorites(token),
          getDashboardStats(token),
        ]);
        setFavorites(favData);
        setStats(statsData);

        // Resolve favorite recipe names to full cards
        const cards: RecipeCardType[] = [];
        for (const fav of favData.slice(0, 12)) {
          try {
            const recipe = await fetchFullRecipe(fav.recipe_name);
            cards.push(fullRecipeToCardType(recipe));
          } catch {
            // If recipe can't be resolved, show a minimal card
            cards.push({
              name: fav.recipe_name,
              macros: [],
              clusterName: "—",
            });
          }
        }
        setFavoriteCards(cards);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [token]);

  const handleUnfavorite = async (recipeName: string) => {
    if (!token) return;
    try {
      await removeFavorite(token, recipeName);
      setFavorites((prev) =>
        prev.filter((f) => f.recipe_name !== recipeName),
      );
      setFavoriteCards((prev) => prev.filter((c) => c.name !== recipeName));
    } catch (err) {
      console.error("Failed to unfavorite:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const interactionIcon = (type: string) => {
    switch (type) {
      case "VIEW":
        return <Eye size={14} weight="duotone" />;
      case "FAVORITE":
        return <Heart size={14} weight="fill" className="text-red-400" />;
      case "UNFAVORITE":
        return <Heart size={14} weight="duotone" className="text-muted-foreground" />;
      case "RATING":
        return <Star size={14} weight="fill" className="text-[#d4943e]" />;
      default:
        return <ClockCounterClockwise size={14} weight="duotone" />;
    }
  };

  if (authLoading || (!user && !loading)) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <ResultLoading label="Loading…" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      {/* Header */}
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p
            className={`${roboto_mono.className} mb-4 text-xs tracking-[0.12em] text-[#4A7865]`}
          >
            TRACK 05 — DASHBOARD
          </p>
          <h1
            className={`${space_grotesk.className} text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl`}
          >
            Your Kitchen.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Welcome back, {user.username}. Here&apos;s what you&apos;ve been
            cooking up.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-[#c9c1b5] px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-[#4A7865] hover:text-foreground"
        >
          <SignOut size={14} />
          Sign out
        </button>
      </header>

      {loading ? (
        <ResultLoading label="Loading your data…" />
      ) : (
        <>
          {/* Quick Stats */}
          <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Recipes Viewed",
                value: stats?.total_views ?? 0,
                icon: Eye,
              },
              {
                label: "Favorites",
                value: favorites.length,
                icon: Heart,
              },
              {
                label: "Ratings Given",
                value: stats?.total_ratings ?? 0,
                icon: Star,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-[#c9c1b5] bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,48,36,0.05)]"
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} weight="duotone" className="text-[#4A7865]" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p
                  className={`${space_grotesk.className} mt-2 text-3xl font-bold text-foreground`}
                >
                  {value}
                </p>
              </div>
            ))}
          </section>

          {/* Favorites */}
          <section className="mb-10">
            <p
              className={`${roboto_mono.className} mb-5 text-xs tracking-[0.12em] text-[#8c5d2f]`}
            >
              YOUR FAVORITES
            </p>
            {favoriteCards.length === 0 ? (
              <div className="rounded-xl border border-[#c9c1b5] bg-white/80 p-8 text-center">
                <Heart
                  size={32}
                  weight="duotone"
                  className="mx-auto mb-3 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  No favorites yet. Browse recipes and tap the heart to save
                  them here.
                </p>
                <Link
                  href="/recipe-search"
                  className="mt-4 inline-block rounded-full bg-[#315c4b] px-5 py-2 text-sm text-white transition-transform hover:-translate-y-0.5"
                >
                  Browse recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteCards.map((card) => (
                  <div key={card.name} className="group relative">
                    <RecipeCard {...card} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnfavorite(card.name);
                      }}
                      className="absolute right-3 top-3 z-10 rounded-full border border-[#c9c1b5] bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                      title="Remove from favorites"
                    >
                      <Heart
                        size={14}
                        weight="fill"
                        className="text-red-400"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section>
            <p
              className={`${roboto_mono.className} mb-5 text-xs tracking-[0.12em] text-[#8c5d2f]`}
            >
              RECENT ACTIVITY
            </p>
            {stats?.recent_recipes && stats.recent_recipes.length > 0 ? (
              <div className="rounded-xl border border-[#c9c1b5] bg-white/80 shadow-[0_18px_60px_rgba(58,48,36,0.05)]">
                {stats.recent_recipes.map((item, idx) => (
                  <Link
                    key={`${item.recipe_name}-${idx}`}
                    href={{
                      pathname: "/recipe",
                      query: { name: item.recipe_name },
                    }}
                    className={`flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4F1EB] ${
                      idx !== stats.recent_recipes.length - 1
                        ? "border-b border-[#e2ddd4]"
                        : ""
                    }`}
                  >
                    {interactionIcon(item.interaction_type)}
                    <span className="flex-1 text-sm text-foreground">
                      {item.recipe_name}
                    </span>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {item.interaction_type.toLowerCase()}
                    </span>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#c9c1b5] bg-white/80 p-8 text-center">
                <ClockCounterClockwise
                  size={32}
                  weight="duotone"
                  className="mx-auto mb-3 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start exploring recipes!
                </p>
              </div>
            )}
          </section>

          {/* Profile Info */}
          <section className="mt-10 rounded-xl border border-[#c9c1b5] bg-white/80 p-6">
            <p
              className={`${roboto_mono.className} mb-4 text-xs tracking-[0.12em] text-[#8c5d2f]`}
            >
              PROFILE
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border-l border-[#d8d0c4] pl-3">
                <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                  Username
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {user.username}
                </p>
              </div>
              <div className="border-l border-[#d8d0c4] pl-3">
                <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 text-sm text-foreground">{user.email}</p>
              </div>
              <div className="border-l border-[#d8d0c4] pl-3">
                <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                  Member since
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
