import TopNav from "~/components/navigation/TopNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-32 p-5">
        <div
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <div className="flex items-center gap-3">
            <h1 className="flex flex-col text-5xl font-extrabold tracking-tight">
              <span className="text-primary">Your.</span>
              <span className="text-accent">Tagline.</span>
            </h1>
          </div>
          <div className="max-w-lg text-center text-xl tracking-tight md:text-2xl">
            Your quick description.
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
        <div className="container flex h-dvh max-w-4xl flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="faq" className="scroll-m-20 text-4xl">
            FAQ
          </h2>
          <Accordion type="single" collapsible className="min-w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Question #1?</AccordionTrigger>
              <AccordionContent>Answer to Question #1.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </>
  );
}
