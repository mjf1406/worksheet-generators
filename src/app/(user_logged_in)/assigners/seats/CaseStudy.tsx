import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CaseStudyCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          Real Classroom Example
        </h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Case Study</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4 space-y-4">
        <p className="text-lg font-semibold">
          Meet Ms. Thompson: A Middle School Science Teacher
        </p>
        <div className="rounded-md bg-accent p-4 text-black">
          <h3 className="mb-2 font-semibold">Classroom Setup:</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Total students: 28</li>
            <li>Lab stations: 7 tables with 4 seats each, numbered 1-28</li>
            <li>Mix of boys and girls</li>
            <li>Various project groups within the class</li>
          </ul>
        </div>
        <p>
          Ms. Thompson wants to assign students to lab stations in a way that
          promotes collaboration, maintains a positive learning environment, and
          rotates students through different stations over time. Here&apos;s how
          she uses the Seating Assignment Tool:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            She selects the &quot;Seating Assignment Tool&quot; from the
            options.
          </li>
          <li>She chooses her Science class from the dropdown menu.</li>
          <li>She inputs her seat identifiers (numbers 1-28 for each seat).</li>
          <li>
            She specifies her project groups, which the tool will try to keep
            together when possible.
          </li>
          <li>
            She clicks &quot;Generate Assignments&quot; to create the new
            seating arrangement.
          </li>
        </ol>
        <p>The Seating Assignment Tool ensures that:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>Each student is assigned to a specific numbered seat.</li>
          <li>
            Boys and girls are distributed evenly across lab stations when
            possible.
          </li>
          <li>
            Students are seated with different classmates than in previous
            assignments as much as possible.
          </li>
          <li>
            Project group members are kept close together when the algorithm
            allows.
          </li>
          <li>
            The process is quick and fair, saving Ms. Thompson time and avoiding
            any perception of favoritism.
          </li>
        </ul>
        <div className="mt-4 rounded-md bg-accent p-4 text-black">
          <h3 className="mb-2 font-semibold">
            Benefits of Smart Seating Assignments:
          </h3>
          <p>
            This system encourages students to work with a variety of peers over
            time, fostering a more inclusive classroom environment. It also
            helps manage lab dynamics by rotating students through different
            stations, ensuring everyone gets experience with all equipment while
            creating opportunities for new collaborations.
          </p>
        </div>
        <p className="italic">
          By using this tool regularly, Ms. Thompson keeps her science lab
          dynamic, encourages diverse interactions, and maintains an optimal
          learning environment for all her students while ensuring they gain
          experience at every lab station.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
