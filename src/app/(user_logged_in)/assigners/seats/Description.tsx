import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SeatingAlgorithmDescription() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">How It Works</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Description</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4 space-y-4">
        <p className="text-lg">
          Welcome, teachers! Our Seating Chart Creator is designed to help you
          arrange your classroom seating quickly and effectively. Here&apos;s
          how it works:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            <strong>Smart Seat Selection:</strong> The tool considers several
            factors when deciding where to seat each student, aiming to create a
            balanced and productive classroom environment.
          </li>
          <li>
            <strong>Boy-Girl Balance:</strong> It tries to alternate between
            seating boys and girls, which can help with classroom management and
            encourage diverse interactions.
          </li>
          <li>
            <strong>Remembers Past Arrangements:</strong> The tool keeps track
            of where students have sat before. It tries to avoid seating
            students next to the same classmates repeatedly, encouraging them to
            interact with different peers over time.
          </li>
          <li>
            <strong>Works for Whole Class or Groups:</strong> You can use it to
            arrange seating for your entire class or for specific groups within
            the class, like reading groups or project teams.
          </li>
          <li>
            <strong>Finds the Best Fit:</strong> For each student, the tool
            looks at all available seats and chooses the one that best meets the
            goals of balance and varied interactions.
          </li>
          <li>
            <strong>Handles Tricky Situations:</strong> If it can&apos;t find an
            ideal seat for a student, the tool will relax some of its rules to
            ensure everyone gets a seat.
          </li>
          <li>
            <strong>Respects Your Class Structure:</strong> If you&apos;ve set
            up specific groups in your class, the tool will keep students within
            their assigned groups while still optimizing their seating within
            that group.
          </li>
        </ol>
        <p>
          This approach helps create a fair, balanced, and dynamic seating
          arrangement that can adapt to your classroom&apos;s needs throughout
          the school year.
        </p>
        <div className="mt-4 rounded-md bg-accent p-4 text-black">
          <h3 className="mb-2 font-semibold">Teacher Tip:</h3>
          <p>
            Consider using this tool every few weeks or at the start of new
            units. (I use it every week!) Regular seating changes can keep the
            classroom environment fresh, encourage new friendships, and prevent
            students from becoming too comfortable (or uncomfortable) with their
            usual neighbors.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
