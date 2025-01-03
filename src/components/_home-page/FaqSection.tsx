import { APP_NAME } from "~/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FAQ() {
  return (
    <>
      <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          FAQ
        </h2>
        <p className="mt-1 text-muted-foreground">
          Got questions? We&apos;ve got answers.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-2xl">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            Who is, and why are you, making {APP_NAME}?
          </AccordionTrigger>
          <AccordionContent>
            My name is{" "}
            <a
              href="https://mr-monkey-portfolio.vercel.app"
              className="underline"
            >
              Michael Fitzgerald
            </a>{" "}
            and I&apos;m from Chicago, IL, but I reside and teach the 5th grade
            in Seoul, South Korea. I&apos;m making {APP_NAME} because I have
            scoured the Internet (and perhaps my Google-fu has failed me) to
            find these tools. Alas, I have found nothing like these on the
            Internet, so I&apos;m making them! Yes, there are other sites that
            do have some of the{" "}
            <a className="underline" href="#features">
              features
            </a>
            , but they are all missing just that extra little thing that I want
            for my classes.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Why is it free right now?</AccordionTrigger>
          <AccordionContent>
            {APP_NAME} is currently free for authorized users because we are in
            alpha. Alpha means that not all of the core features are
            implemented. At some point, we will have a public beta.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How much will it cost at release?</AccordionTrigger>
          <AccordionContent>
            I am honestly not sure about this. There is only one person who is
            making this, though, so that means {APP_NAME}&apos;s overhead is
            very low, and I hope to keep it that way. My goal is to be able to
            offer it for 3 USD per month if you sign up for a year, else 5 USD
            per month, but I&apos;m not promising anything.
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
            High-quality feedback discusses the issue like you are speaking with
            your doctor. The developers for{" "}
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
        <AccordionItem value="item-6">
          <AccordionTrigger>Where is the cookie banner?</AccordionTrigger>
          <AccordionContent>
            We only use cookies to keep you logged in. These are necessary and
            cannot be refused because doing so would mean you could not use the
            site.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-7">
          <AccordionTrigger>
            Wait... That means that you do not track me?
          </AccordionTrigger>
          <AccordionContent>
            That&apos;s right! There will never be ads and we will never track
            you for the purposes of selling your data or advertisements. We will
            never store your personal information (your email and your name) for
            anything other than verifying you are you and keeping you logged in.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
