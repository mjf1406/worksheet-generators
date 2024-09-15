import React, { useState } from "react";
import Link from "next/link";
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
          Meet Ms. Johnson: A 5th Grade Teacher with a Split Class Schedule
        </p>
        <div className="rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">Classroom Setup:</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Total students: 28</li>
            <li>
              Split into two groups: Group A and Group B (14 students each)
            </li>
            <li>Ms. Johnson teaches each group separately</li>
          </ul>
        </div>
        <p>
          Ms. Johnson wants to ensure that classroom jobs are distributed fairly
          among all her students, even though she doesn&apos;t see them all at
          the same time. Here&apos;s how she uses the Round-Robin Assigner:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            She selects the &quot;Jobs Assigner&quot; from the tool options.
          </li>
          <li>She chooses her class from the dropdown menu.</li>
          <li>Importantly, she selects both Group A and Group B.</li>
          <li>
            She clicks &quot;Run Assigner&quot; to generate the job assignments.
          </li>
        </ol>
        <p>The Round-Robin Assigner ensures that:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            Each job is covered by one student from Group A and one from Group
            B.
          </li>
          <li>
            Students don&apos;t repeat a job until they&apos;ve had a chance to
            do all other jobs.
          </li>
          <li>
            Over time, all students get equal opportunities to experience each
            classroom job and the responsibilities it entails.
          </li>
        </ul>
        <div className="mt-4 rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">
            Comparison with Random Assigner:
          </h3>
          <p>
            Unlike the{" "}
            <Link
              className="text-blue-600 underline hover:text-blue-800"
              href="/tool/assigner/random"
            >
              Random Assigner
            </Link>
            , which might assign the same job to a student multiple times before
            others get a chance, the Round-Robin method ensures a fair rotation
            of all jobs among all students.
          </p>
        </div>
        <p className="italic">
          By using this tool, Ms. Johnson saves time on job assignments and
          ensures fairness, allowing her to focus more on teaching and less on
          classroom management logistics.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
