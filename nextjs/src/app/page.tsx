"use client";

import {
  ArrowDown,
  ArrowUpRight,
  ChartScatter,
  CirclesThreePlus,
  Database,
  MagnifyingGlass,
  SlidersHorizontal,
  Sparkle,
} from "@phosphor-icons/react";
import { animate, createScope, stagger } from "animejs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Aurora,
  CursorTrail,
  FilmGrain,
  LinearGradient,
  Shader,
  Vignette,
} from "shaders/react";
import { roboto_mono, space_grotesk } from "../lib/fonts";
import styles from "./page.module.css";

const features = [
  {
    number: "01",
    title: "Macro Matcher",
    description:
      "Shape the meal around the numbers that matter to you. Weighted distance finds recipes nearest to your nutrition profile.",
    href: "/macro-matcher",
    cta: "Tune your plate",
    icon: SlidersHorizontal,
  },
  {
    number: "02",
    title: "Recipe Search",
    description:
      "Move through the collection by dish, ingredient, or nutritional family—without needing to know exactly what you want yet.",
    href: "/recipe-search",
    cta: "Search the collection",
    icon: MagnifyingGlass,
  },
  {
    number: "03",
    title: "Cluster Explorer",
    description:
      "Browse the naturally occurring families in the data, from lighter sides to rich mains, sweets, and balanced staples.",
    href: "/cluster-explorer",
    cta: "Explore the families",
    icon: CirclesThreePlus,
  },
];

const methodology = [
  {
    number: "01",
    title: "Gather",
    body: "Recipe, ingredient, method, and nutrition data are collected from Omnivore’s Cookbook and The Woks of Life.",
    icon: Database,
  },
  {
    number: "02",
    title: "Refine",
    body: "Duplicates are removed, nutrition labels are parsed, extreme outliers are reviewed, and skewed features are power-transformed.",
    icon: Sparkle,
  },
  {
    number: "03",
    title: "Discover",
    body: "K-means and centroid analysis reveal distinct nutritional archetypes across seven signals instead of imposing hand-made categories.",
    icon: ChartScatter,
  },
  {
    number: "04",
    title: "Match",
    body: "Your selected macros become a point in that same feature space; weighted distance brings the closest recipes to the surface.",
    icon: SlidersHorizontal,
  },
];

function HeroShader() {
  return (
    <div className={styles.shaderWrap} aria-hidden="true">
      <div className={styles.shaderFallback} />
      <Shader
        className={styles.shaderCanvas}
        colorSpace="srgb"
        toneMapping="neutral"
        disableTelemetry
      >
        <LinearGradient
          colorA="#eadfcf"
          colorB="#a7b8a5"
          angle={122}
          colorSpace="oklch"
        />
        <Aurora
          colorA="#d89a55"
          colorB="#dcd1b6"
          colorC="#668b79"
          balance={58}
          intensity={28}
          curtainCount={3}
          speed={0.35}
          waviness={36}
          rayDensity={10}
          height={115}
          center={{ x: 0.68, y: 0.2 }}
          opacity={0.62}
        />
        <CursorTrail
          colorA="#f3d7a5"
          colorB="#6f9984"
          radius={0.7}
          length={1.2}
          shrink={0.85}
          opacity={0.22}
        />
        <FilmGrain strength={0.12} bias={1.4} animated={false} />
        <Vignette color="#315747" radius={0.55} falloff={0.9} intensity={0.25} />
      </Shader>
    </div>
  );
}

export default function Home() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: {
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
    }).add((self) => {
      if (!self?.matches.reduceMotion) {
        animate("[data-hero-reveal]", {
          opacity: [0, 1],
          y: [28, 0],
          duration: 950,
          delay: stagger(90),
          ease: "outExpo",
        });
        animate("[data-orbit]", {
          rotate: [0, 360],
          duration: 26000,
          loop: true,
          ease: "linear",
        });
      }
    });

    const revealTargets = root.current?.querySelectorAll<HTMLElement>(
      "[data-scroll-reveal]",
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          if (reduceMotion) target.style.opacity = "1";
          else {
            animate(target, {
              opacity: [0, 1],
              y: [24, 0],
              duration: 800,
              ease: "outCubic",
            });
          }
          observer.unobserve(target);
        });
      },
      { threshold: 0.14 },
    );

    revealTargets?.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      scope.revert();
    };
  }, []);

  return (
    <main ref={root} className={styles.page}>
      <section className={styles.hero}>
        <HeroShader />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p data-hero-reveal className={`${styles.eyebrow} ${roboto_mono.className}`}>
              A DATA-DRIVEN CHINESE COOKBOOK
            </p>
            <h1 data-hero-reveal className={`${styles.heroTitle} ${space_grotesk.className}`}>
              Cook by feeling.
              <br />
              <span>Choose by signal.</span>
            </h1>
            <p data-hero-reveal className={styles.heroBody}>
              Jian turns a living archive of Chinese recipes into a softer way to decide what’s for dinner—guided by nutrition, ingredients, and the shape of your day.
            </p>
            <div data-hero-reveal className={styles.heroActions}>
              <Link href="/macro-matcher" className={styles.primaryButton}>
                Find my recipe <ArrowUpRight size={17} weight="bold" />
              </Link>
              <Link href="/recipe-search" className={styles.textButton}>
                Browse the cookbook
              </Link>
            </div>
          </div>

          <div data-hero-reveal className={styles.recordStage} aria-hidden="true">
            <div data-orbit className={styles.dataOrbit}>
              <span>7 SIGNALS</span>
              <span>WEIGHTED MATCH</span>
              <span>K-MEANS</span>
            </div>
            <div className={styles.record}>
              <div className={styles.recordGrooves} />
              <div className={styles.recordLabel}>
                <span className={roboto_mono.className}>JIAN / SIDE A</span>
                <strong className={space_grotesk.className}>食</strong>
                <small>recipes in rhythm</small>
              </div>
            </div>
            <div className={styles.toneArm} />
          </div>
        </div>

        <a href="#features" className={styles.scrollCue} aria-label="Scroll to features">
          <ArrowDown size={16} />
          <span className={roboto_mono.className}>DROP THE NEEDLE</span>
        </a>
      </section>

      <section id="features" className={styles.featureSection}>
        <div data-scroll-reveal className={styles.sectionHeading}>
          <p className={`${styles.eyebrow} ${roboto_mono.className}`}>THREE WAYS IN</p>
          <h2 className={`${space_grotesk.className} ${styles.sectionTitle}`}>
            Start with a number.<br />Start with a craving.
          </h2>
          <p>However you arrive, the data stays quietly in the background.</p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.number}
                href={feature.href}
                data-scroll-reveal
                className={styles.featureCard}
              >
                <div className={styles.cardTopline}>
                  <span className={roboto_mono.className}>TRACK {feature.number}</span>
                  <Icon size={22} weight="duotone" />
                </div>
                <h3 className={space_grotesk.className}>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className={styles.cardCta}>
                  {feature.cta} <ArrowUpRight size={15} weight="bold" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.methodSection}>
        <div data-scroll-reveal className={styles.methodIntro}>
          <p className={`${styles.eyebrow} ${roboto_mono.className}`}>BEHIND THE RECOMMENDATION</p>
          <h2 className={`${space_grotesk.className} ${styles.sectionTitle}`}>
            From messy recipes<br />to meaningful neighbors.
          </h2>
          <p>
            This is a hand-built FastAPI and machine-learning pipeline—not a black box. Each recommendation can be traced back to cleaned, transformed nutrition data.
          </p>
          <div className={styles.signalRow}>
            {[
              "Calories",
              "Carbs",
              "Protein",
              "Fat",
              "Sat. fat",
              "Sodium",
              "Sugar",
            ].map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>

        <div className={styles.methodList}>
          {methodology.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} data-scroll-reveal className={styles.methodStep}>
                <span className={`${styles.stepNumber} ${roboto_mono.className}`}>{step.number}</span>
                <Icon size={24} weight="duotone" />
                <div>
                  <h3 className={space_grotesk.className}>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.manifestoSection}>
        <div data-scroll-reveal className={styles.manifestoDisc} aria-hidden="true">
          <div />
        </div>
        <blockquote data-scroll-reveal className={space_grotesk.className}>
          “Good food is instinct.<br />Good tools make room for it.”
        </blockquote>
        <p data-scroll-reveal>
          Built for the moment between opening the fridge and knowing what comes next.
        </p>
      </section>

      <section className={styles.finalCta}>
        <div data-scroll-reveal>
          <p className={`${styles.eyebrow} ${roboto_mono.className}`}>YOUR NEXT MEAL / SIDE B</p>
          <h2 className={`${space_grotesk.className} ${styles.sectionTitle}`}>Let the data speak.</h2>
        </div>
        <Link data-scroll-reveal href="/macro-matcher" className={styles.roundButton}>
          <span>Find a recipe</span>
          <ArrowUpRight size={28} />
        </Link>
      </section>

      <footer className={styles.footer}>
        <span className={`${space_grotesk.className} ${styles.footerLogo}`}>JIAN</span>
        <p>Chinese recipes, arranged by signal.</p>
        <span className={roboto_mono.className}>MADE WITH DATA + APPETITE</span>
      </footer>
    </main>
  );
}
