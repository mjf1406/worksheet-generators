// pages/components/StudentBehaviorLeadersCard.tsx

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card"; // Adjust the import path based on your project structure

interface BehaviorAggregate {
  behavior: string;
  type: string;
  totalPoints: number;
  otherStudentsCount?: number; // include this field
}

interface Props {
  topPositive: BehaviorAggregate[];
  topNegative: BehaviorAggregate[];
}

export default function StudentBehaviorLeadersCard({
  topPositive,
  topNegative,
}: Props) {
  return (
    <Card className="mx-auto max-w-2xl bg-white dark:bg-black">
      <CardHeader>
        <CardTitle>Are you #1 in the class?</CardTitle>
        <CardDescription>
          Take a look at all the behaviors where you&apos;re number one in the
          whole class! Careful! It&apos;s not so good to be #1 for negative
          behaviors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive Behaviors */}
        <div>
          <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
            Glows
          </h3>
          {topPositive.length !== 0 && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              These are the positive behaviors where you&apos;re ranked #1 in
              the whole class! Keep up the great work! You&apos;re crushing it!
              💪
            </p>
          )}
          {topPositive.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              You&apos;re not #1 in any positive behaviors. YET! Just keep
              working hard and I&apos;m sure you&apos;ll get there soon! You can
              do it! 😁
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topPositive.map((b, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md bg-green-100 p-3 dark:bg-green-800"
                >
                  <span className="font-medium text-green-800 dark:text-green-100">
                    {b.behavior}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 dark:text-gray-200">
                      {b.totalPoints} pts
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {b.otherStudentsCount && b.otherStudentsCount > 0
                        ? `(+${b.otherStudentsCount} others)`
                        : `(You're #1 🎉)`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Negative Behaviors */}
        <div>
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
            Grows
          </h3>
          {topNegative.length !== 0 && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              These are the negative behaviors where you&apos;re ranked #1 in
              the whole class. I know you can do better. Think carefully before
              doing one of the below again. 🥺
            </p>
          )}
          {topNegative.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Congratulations! You&apos;re so well-behaved because you&apos;re
              not #1 in any negative behaviors! Keep being awesome 😁
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topNegative.map((b, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md bg-red-100 p-3 dark:bg-red-800"
                >
                  <span className="font-medium text-red-800 dark:text-red-100">
                    {b.behavior}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 dark:text-gray-200">
                      {b.totalPoints} pts
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {b.otherStudentsCount && b.otherStudentsCount > 0
                        ? `(+${b.otherStudentsCount} others)`
                        : `(You're #1 😢)`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
