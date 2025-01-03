import React from "react";
import MainNav from "~/components/navigation/MainNav";
import FAQ from "~/components/_home-page/FaqSection";
import PricingSection from "~/components/_home-page/PricingSection";
import FeaturesSection from "~/components/_home-page/FeaturesSection";
import HeroSection from "~/components/_home-page/HeroSection";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="text-text flex min-h-screen flex-col items-center justify-center bg-background">
        <section
          id="hero"
          className="container relative flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
          // className="container relative flex h-dvh flex-col items-center justify-center gap-12 bg-gradient-to-br from-transparent via-accent/30 to-transparent px-4 py-16"
        >
          <HeroSection />
          {/* <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-background to-transparent"></div> */}
        </section>

        <section
          id="features"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <FeaturesSection />
        </section>

        <section
          id="pricing"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <PricingSection />
        </section>

        <section
          id="faq"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <FAQ />
        </section>
      </main>
    </>
  );
}
