import {
  screensData,
  toolsData,
  generatorsData,
  assignersData,
} from "~/lib/constants";
import ItemGrid from "../ItemGrid";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
  return (
    <>
      <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Features
        </h2>
        <p className="mt-1 text-muted-foreground">
          Explore tools that enhance your classroom with gamified learning
          elements. The below features aim to boost student engagement while
          simplifying your teaching workflow.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-1">
        <div>
          <h3 className="mb-4 text-2xl font-semibold">Screens</h3>
          <ItemGrid data={screensData} />
        </div>
        <div>
          <h3 className="mb-4 text-2xl font-semibold">Tools</h3>
          <ItemGrid data={toolsData} />
        </div>
        <div>
          <h3 className="mb-4 text-2xl font-semibold">Generators</h3>
          <p className="text-muted-foreground">
            Looking for something we don&apos;t have? Maybe{" "}
            <Link
              className="inline-flex items-start gap-1 whitespace-nowrap underline"
              href="https://web.diffit.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>Diffit</div> <ExternalLink size={18} />
            </Link>{" "}
            has it!
          </p>
          <ItemGrid data={generatorsData} />
        </div>
        <div>
          <h3 className="mb-4 text-2xl font-semibold">Assigners</h3>
          <ItemGrid data={assignersData} />
        </div>
      </div>
    </>
  );
}
