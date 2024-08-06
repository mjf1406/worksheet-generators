"use client";
import MainNav from "~/components/navigation/MainNav";
import { FlipWords } from "~/components/ui/flip-words";
import { Button } from "~/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { FLIP_WORDS } from "~/lib/constants";
import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export default function HomePage() {
  const [isLoadingSignIn, loadingSignIn] = React.useState(false);

  const handleClick = () => {
    loadingSignIn(true);
  };
  return (
    <>
      <MainNav />
      <main className="text-text flex min-h-screen flex-col items-center justify-center bg-background">
        <div
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <div className="flex items-center gap-3">
            <h1 className="flex flex-col text-5xl font-extrabold tracking-tight">
              <span className="text-primary">Your classroom.</span>
              <span className="text-accent">Gamified.</span>
            </h1>
          </div>
          <div className="max-w-lg text-center text-xl tracking-tight md:text-2xl">
            Dive into a world where education meets <br />{" "}
            <span>
              <FlipWords
                className="text-2xl font-bold md:text-3xl"
                words={FLIP_WORDS}
              />
            </span>
            <br />
            <div className="pt-5">
              Earn rewards, unlock achievements, and transform everyday learning
              into an epic quest.
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <SignedIn>
              <div>
                {isLoadingSignIn ? (
                  <Button
                    disabled={true}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </Button>
                ) : (
                  <Button className="px-8" asChild onClick={handleClick}>
                    <Link href="/classes">
                      Get started
                      <ArrowRight className="ml-0.5 inline-block h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </SignedIn>
            <SignedOut>
              <div>
                {isLoadingSignIn ? (
                  <Button
                    disabled={true}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </Button>
                ) : (
                  <Button asChild onClick={handleClick}>
                    <Link href="/auth/sign-in">Sign in to get Started</Link>
                  </Button>
                )}
              </div>
            </SignedOut>

            <Button
              variant="secondary"
              className="text-text/70 bg-secondary/30 px-8 hover:bg-secondary/40"
              asChild
            >
              <Link href={"#features"}>Learn more</Link>
            </Button>
          </div>
        </div>
        <div className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="features" className="scroll-m-20 text-4xl">
            Features
          </h2>
        </div>
        <div className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="pricing" className="scroll-m-20 text-4xl">
            Pricing
          </h2>
        </div>
        <div className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="faq" className="scroll-m-20 text-4xl">
            FAQ
          </h2>
          <Accordion type="single" collapsible className="min-w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Who is, and why are you, making ClassQuest?
              </AccordionTrigger>
              <AccordionContent>
                My name is{" "}
                <a
                  href="https://mjf1406-portfolio.netlify.app/"
                  className="underline"
                >
                  Michael Fitzgerald
                </a>{" "}
                and I&apos;m from Chicago, IL, but I reside and teach the 5th
                grade in Seoul, South Korea. I&apos;m making ClassQuest because
                Classcraft was{" "}
                <a href="https://www.classcraft.com/blog/important-announcement-the-future-of-classcraft/">
                  acquired by HMH
                </a>{" "}
                and we don&apos;t know when, if ever, they&apos;ll implement all
                of the Classcraft features into HMH Classcraft.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Why is it free right now?</AccordionTrigger>
              <AccordionContent>
                ClassQuest is currently free for authorized users because we are
                in alpha. Use at your own risk. We make no guarantees about the
                integrity of your data. At some point, we will have a public
                beta. Sign up to be notified{" "}
                <a href="" className="underline">
                  here
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                How much will it cost at release?
              </AccordionTrigger>
              <AccordionContent>
                I am honestly not sure about this. There is only one person who
                is making this, though, so that means ClassQuest&apos;s overhead
                is very low, and I hope to keep it that way. My goal is to be
                able to offer it for 3 USD per month if you sign up for a year,
                else 5 USD per month, but I&apos;m not promising anything.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                What is currently being worked on at ClassQuest?
              </AccordionTrigger>
              <AccordionContent>
                Since ClassQuest is in alpha, that means not all of the core
                features have been implemented, so we&apos;re working to
                implement all of the core features. You can view the public
                roadmap{" "}
                <a
                  className="underline"
                  href="https://github.com/users/mjf1406/projects/1/views/1"
                >
                  here
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                Where do I submit feature requests?
              </AccordionTrigger>
              <AccordionContent>
                Feature requests can be submitted{" "}
                <a className="underline" href="">
                  here
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Where do I submit feedback?</AccordionTrigger>
              <AccordionContent>
                When submitting bad feedback, please provide a detailed
                desciption of your issue so I can replicate the issue on my end
                in order to fix it. Feedback, both good and bad, can be
                submitted{" "}
                <a className="underline" href="">
                  here
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>
                Would you ever consider being acquired?
              </AccordionTrigger>
              <AccordionContent>
                Yes, I would, but the amount of money offered would have to be
                more than enough to set me up for life.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </>
  );
}
