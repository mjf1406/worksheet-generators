import { AlertTriangleIcon, ArrowRight, Check } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { FlipWords } from "../ui/flip-words";
import { FLIP_WORDS } from "~/lib/constants";
import { WaitlistCard } from "./WaitlistCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const clearDoubts = [
  "Equitable seat and job assignments.",
  "Manage assignment requirements and expectations.",
  "Track behavior streaks automatically with achievements.",
  "Automated and customizable achievements.",
  "Reward titles tied to behaviors and reward items.",
  "Dashboards for students to see all the things!",
];

export default function HeroSection() {
  return (
    <div className="container relative mx-auto px-6 md:px-12 lg:px-16">
      <div className="mt-10 grid min-h-[70vh] grid-cols-1 items-center gap-8 md:mt-0 md:grid-cols-5">
        {/* Left Column */}
        <div className="flex flex-col items-start justify-center gap-3 md:col-span-3">
          {/* Kicker with Stars and Reviews */}
          <div className="flex flex-col items-start gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="flex items-center">😁😁😁😁😁</div>
              <p>Numerous happy alpha testers</p>
            </div>
            <p className="">Don&apos;t keep your students waiting!</p>
          </div>

          {/* Super Clear Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            <span className="text-primary">Your classroom.</span> <br />
            <span className="text-accent"> Gamified.</span>
          </h1>

          {/* Extra Context with FlipWords */}
          <p className="max-w-lg text-left text-lg tracking-tight md:text-xl">
            Dive into a world where education <br /> meets
            <FlipWords className="-ml-1 font-bold" words={FLIP_WORDS} />
          </p>
          <p className="max-w-lg font-light">
            Earn rewards, unlock achievements, and transform everyday learning
            into an epic quest.
          </p>

          {/* Clear Doubts with Checkmarks */}
          <div className="font=light flex flex-col gap-2 text-sm">
            {clearDoubts.map((doubt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="text-green-500" size={16} />{" "}
                <span>{doubt}</span>
              </div>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Button className="px-6 py-3 text-base" asChild>
                      <Link href="/classes">
                        Get started <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Alpha testers only for now!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <AlertTriangleIcon size={16} /> Alpha testers only!
              </div>
            </div>

            <Button variant="secondary" className="px-6 py-3 text-base" asChild>
              <Link href="#features">Learn more</Link>
            </Button>
          </div>
        </div>

        {/* Right Column with Custom WaitlistCard */}
        <div className="flex items-center justify-center md:col-span-2">
          <WaitlistCard />
        </div>
      </div>
    </div>
  );
}
