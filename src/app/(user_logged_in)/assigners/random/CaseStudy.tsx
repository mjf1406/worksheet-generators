"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CaseStudyCollapsible() {
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
          Meet Ms. Garcia: A Middle School Technology Teacher
        </p>
        <div className="rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">Classroom Setup:</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Total students: 25</li>
            <li>Available Chromebooks: 25 (numbered 1-25)</li>
            <li>Daily computer classes with shared devices</li>
          </ul>
        </div>
        <p>
          Ms. Garcia wants to randomly assign Chromebooks to her students each
          day, ensuring fair usage and shared responsibility for the devices.
          Here&apos;s how she uses the Random Assigner:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            She selects the &quot;Chromebook Assigner&quot; from the tool
            options.
          </li>
          <li>She chooses her technology class from the dropdown menu.</li>
          <li>She ensures all students are included in the assignment pool.</li>
          <li>
            She clicks &quot;Run Assigner&quot; to generate the random
            Chromebook assignments.
          </li>
        </ol>
        <p>The Random Assigner ensures that:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>Each student is assigned a Chromebook for the day.</li>
          <li>
            The assignment is truly random, which means a student might get the
            same Chromebook two days in a row, but that does not matter because
            Chromebooks are fungible.
          </li>
          <li>
            The process is quick and fair, saving Ms. Garcia time at the start
            of each class.
          </li>
        </ul>
        <div className="mt-4 rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">
            Benefits of Random Assignment for Chromebooks:
          </h3>
          <p>
            Unlike a fixed assignment system, the Random Assigner prevents
            students from becoming too attached to &quot;their&quot; Chromebook.
            This promotes shared responsibility for all devices and helps in
            early detection of any issues with specific Chromebooks.
          </p>
        </div>
        <p className="italic">
          By using this tool, Ms. Garcia ensures equitable access to technology,
          teaches students about shared resources, and simplifies her classroom
          management.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
