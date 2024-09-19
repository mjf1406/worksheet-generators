import { FLIP_WORDS } from "~/lib/constants";
import { FlipWords } from "../ui/flip-words";
import AuthButton from "../brand/AuthButton";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <>
      <h1 className="flex flex-col text-5xl font-extrabold tracking-tight">
        <span className="text-primary">Your classroom.</span>
        <span className="text-accent">Gamified.</span>
      </h1>
      <div className="max-w-lg text-center text-xl tracking-tight md:text-2xl">
        Dive into a world where education meets <br />
        <FlipWords
          className="text-2xl font-bold md:text-3xl"
          words={FLIP_WORDS}
        />
        <p className="pt-5">
          Earn rewards, unlock achievements, and transform everyday learning
          into an epic quest.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <AuthButton />
        <Button
          variant="secondary"
          className="text-text/70 bg-secondary/30 px-8 hover:bg-secondary/40"
          asChild
        >
          <Link href="#features">Learn more</Link>
        </Button>
      </div>
    </>
  );
}
