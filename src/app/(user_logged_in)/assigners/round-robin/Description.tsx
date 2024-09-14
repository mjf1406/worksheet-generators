"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function DescriptionCollapsible() {
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
          Welcome, teachers! This tool is designed to help you fairly distribute
          classroom jobs or responsibilities among your students. Here&apos;s
          how it works:
        </p>
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            <strong>Fair Distribution:</strong> The tool ensures that each
            student gets a chance to do every job before any student repeats a
            job.
          </li>
          <li>
            <strong>Priority System:</strong> It prioritizes students who have
            not had a chance to do a particular job yet.
          </li>
          <li>
            <strong>Balanced Workload:</strong> The system keeps track of how
            many jobs each student has done overall, trying to keep the total
            number of jobs balanced among all students.
          </li>
          <li>
            <strong>Gender Balance:</strong> For jobs that require two students,
            it aims to pair one boy and one girl when possible.
          </li>
          <li>
            <strong>Memory:</strong> The tool remembers previous assignments, so
            it can make fair decisions even across multiple uses.
          </li>
        </ol>
        <p>
          This approach ensures that all students get equal opportunities to
          experience different classroom responsibilities, promoting fairness
          and inclusivity in your classroom management.
        </p>
        <div className="mt-4 rounded-md bg-accent p-4 text-background">
          <h3 className="mb-2 font-semibold">Pro Tip:</h3>
          <p>
            Consider rotating jobs weekly or bi-weekly. This gives students
            enough time to become comfortable with each responsibility while
            still providing variety throughout the school year.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
