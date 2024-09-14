"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export function DescriptionCollapsible() {
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
          Welcome, educators! The Random Assigner is designed to help you
          quickly and fairly distribute tasks or roles among your students.
          Here&apos;s how it works:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            <strong>True Randomness:</strong> The tool uses a robust random
            selection process to assign tasks or roles, ensuring no bias in the
            selections.
          </li>
          <li>
            <strong>Fungibility:</strong> We recommend you use this assigner for
            fungible things, such as Chromebook assignments, because it
            doesn&apos;t matter if a student get&apos;s assigned the same
            Chromebook many times in a row.
          </li>
          <li>
            <strong>Group Handling:</strong> It can work with entire classes or
            specific groups within a class, allowing for flexible use in various
            classroom structures.
          </li>
          <li>
            <strong>Equal Opportunity:</strong> While not guaranteeing equal
            distribution over time like the Round-Robin method, it provides
            equal opportunity for all students in each assignment round.
          </li>
          <li>
            <strong>Quick Assignments:</strong> Ideal for frequent reassignments
            or when you want to shake things up in your classroom dynamics.
          </li>
          <li>
            <strong>Customizable Items:</strong> You can create and save
            different sets of items or roles for various classroom activities or
            subjects.
          </li>
        </ol>
        <p>
          This approach is perfect for situations where you want to maintain an
          element of surprise or when equal long-term distribution is less
          critical than immediate fairness and engagement.
        </p>
        <div className="mt-4 rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">Pro Tip:</h3>
          <p>
            Use the Random Assigner for fungible things, short-term projects, or
            daily tasks. For longer-term roles or when you want to ensure every
            student experiences every role, consider using the{" "}
            <Link
              href="/tool/assigner/round-robin"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Round-Robin Assigner
            </Link>
            &nbsp;instead.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
