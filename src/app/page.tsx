import React from "react";
import Link from "next/link";
import MainNav from "~/components/navigation/MainNav";
import { FlipWords } from "~/components/ui/flip-words";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { FLIP_WORDS, APP_NAME } from "~/lib/constants";
import {
  screensData,
  toolsData,
  generatorsData,
  assignersData,
} from "~/lib/constants";
import ItemGrid from "~/components/ItemGrid";
import AuthButton from "~/components/brand/AuthButton";

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="text-text flex min-h-screen flex-col items-center justify-center bg-background">
        <section
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
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
        </section>

        <section
          id="features"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <h2 className="scroll-m-20 text-4xl font-bold">Features</h2>
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
              <ItemGrid data={generatorsData} />
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-semibold">Assigners</h3>
              <ItemGrid data={assignersData} />
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <h2 className="scroll-m-20 text-4xl font-bold">Pricing</h2>
          <p className="text-center text-xl">
            {APP_NAME} is currently in alpha and free for authorized users.{" "}
            <br />
            Stay tuned for pricing information and sign up to be notified about
            the public beta{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeE-DqpOUqjmKFm-W4QodtpgO3m0BV7LWdxYF-QgTZ6ntPlrQ/viewform?usp=sf_link"
              className="underline"
            >
              here
            </a>
            .
          </p>
        </section>

        <section
          id="faq"
          className="container flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <h2 className="scroll-m-20 text-4xl font-bold">FAQ</h2>
          <Accordion type="single" collapsible className="w-full max-w-2xl">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Who is, and why are you, making {APP_NAME}?
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
                grade in Seoul, South Korea. I&apos;m making {APP_NAME} because
                I have scoured the Internet (and perhaps my Google-fu has failed
                me) to find these tools. Alas, I have found nothing like these
                on the Internet, so I&apos;m making them! Yes, there are other
                sites that do have some of the{" "}
                <a className="underline" href="#features">
                  features
                </a>
                , but they are all missing just that extra little thing that I
                want for my classes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Why is it free right now?</AccordionTrigger>
              <AccordionContent>
                {APP_NAME} is currently free for authorized users because we are
                in alpha. Alpha means that not all of the core features are
                implemented. At some point, we will have a public beta. Sign up
                to be notified{" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeE-DqpOUqjmKFm-W4QodtpgO3m0BV7LWdxYF-QgTZ6ntPlrQ/viewform?usp=sf_link"
                  className="underline"
                >
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
                is making this, though, so that means {APP_NAME}&apos;s overhead
                is very low, and I hope to keep it that way. My goal is to be
                able to offer it for 3 USD per month if you sign up for a year,
                else 5 USD per month, but I&apos;m not promising anything.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Where do I submit feature requests and offer suggestions?
              </AccordionTrigger>
              <AccordionContent>
                Feature requests and suggestions can be submitted{" "}
                <a href="#" className="underline">
                  COMING SOON
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Where do I submit feedback?</AccordionTrigger>
              <AccordionContent>
                High-quality feedback provides context, is detailed, specific,
                criticizes constructively, and DOES NOT suggest improvements.
                Why do I not want your suggestions to fix your problem? It is
                because you are (likely) not an expert in web design,
                programming, or systems design. But you do have, and what I care
                about, is <b>how you feel</b> about what caused you to have a
                bad experience. The developers for{" "}
                <a
                  className="underline"
                  href="https://playruneterra.com/en-sg/news/dev/giving-feedback-like-a-game-dev/"
                >
                  Legends of Runeterra put it best
                </a>{" "}
                when they said,{" "}
                <i>
                  “Describe your experience the way you might explain how
                  you&apos;re feeling to a doctor (without all the personal
                  information).”
                </i>{" "}
                Feedback, both positive and negative, can be submitted{" "}
                <a href="#" className="underline">
                  COMING SOON
                </a>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </>
  );
}
