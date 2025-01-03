// components/HeroSection.tsx
import {
  AlertTriangleIcon,
  ArrowRight,
  Check,
  MessageSquareWarning,
  Star,
} from "lucide-react";
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
    <div className="mx-auto grid min-h-[50vh] w-full max-w-5xl grid-cols-5 gap-8">
      {/* Left Column */}
      <div className="col-span-3 flex flex-col items-start justify-center gap-5">
        {/* Kicker with Stars and Reviews */}
        <div className="text-xs">
          <div className="flex items-center justify-start gap-1">
            <div className="flex items-center justify-center">😁😁😁😁😁</div>
            <p>numerous happy alpha testers</p>
          </div>
          <p>Don&apos;t keep your students waiting!</p>
        </div>

        {/* Super Clear Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="text-primary">Your classroom.</span>
          <span className="text-accent"> Gamified.</span>
        </h1>

        {/* Extra Context with FlipWords */}
        <p className="max-w-lg text-left text-xl tracking-tight md:text-2xl">
          Dive into a world where education meets
          <FlipWords
            className="text-xl font-bold md:text-2xl"
            words={FLIP_WORDS}
          />
        </p>
        <p>
          Earn rewards, unlock achievements, and transform everyday learning
          into an epic quest.
        </p>

        {/* Clear Doubts with Checkmarks */}
        <div className="flex flex-col gap-2 text-sm">
          {clearDoubts.map((doubt, index) => (
            <div key={index} className="flex items-center justify-start gap-1">
              <Check size={16} /> <span>{doubt}</span>
            </div>
          ))}
        </div>

        {/* Call to Action Buttons */}
        <div className="flex space-x-2">
          <div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Button className="px-8" asChild>
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
            <div className="mt-0.5 flex w-full items-center gap-1 text-center text-xs text-muted-foreground">
              <AlertTriangleIcon size={16} /> Alpha testers only!
            </div>
          </div>

          <Button
            variant="secondary"
            className="text-text/70 bg-secondary/30 px-8 hover:bg-secondary/40"
            asChild
          >
            <Link href="#features">Learn more</Link>
          </Button>
        </div>
      </div>

      {/* Right Column with Custom WaitlistCard */}
      <div className="col-span-2 flex items-center justify-center">
        <WaitlistCard />
      </div>
    </div>
  );
}
