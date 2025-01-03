import { APP_NAME } from "~/lib/constants";
import React from "react";
import ComparisonTable from "./ComparisonTable";
import PricingCardGrid from "./PricingCardGrid";

export default function PricingSection() {
  return (
    <>
      {/* Pricing */}
      <div className="container py-24 lg:py-32">
        {/* Title */}
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Pricing
          </h2>
          <p className="mt-1 text-muted-foreground">
            {APP_NAME} is currently in alpha and free for authorized users. Stay
            tuned for pricing information.
          </p>
        </div>
        {/* <PricingCardGrid /> */}
        {/* <ComparisonTable /> */}
      </div>
    </>
  );
}
