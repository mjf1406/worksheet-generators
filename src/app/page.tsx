import React from "react";
import MainNav from "~/components/navigation/MainNav";
import FAQ from "~/components/_home-page/FaqSection";
import PricingSection from "~/components/_home-page/PricingSection";
import FeaturesSection from "~/components/_home-page/FeaturesSection";
import HeroSection from "~/components/_home-page/HeroSection";

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="text-text flex min-h-screen flex-col items-center justify-center bg-background">
        <section
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <HeroSection />
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
