"use client";

import React from "react";
import { ACHIEVEMENTS, type AchievementData } from "~/lib/constants";
import type { PointClient } from "./PointsCard";

// ShadCN UI imports
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

// Card UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { FontAwesomeIconClient } from "~/components/FontAwesomeIconClient";
import { Button } from "~/components/ui/button";

// Typed shape for unlocked achievements
interface UnlockedAchievement extends AchievementData {
  threshold: number;
  behavior_name: string | null | undefined;
  reward_item_name: string | null | undefined;
  created_date: string;
}

// We gather these data points for each "group"
interface GroupedData {
  itemKey: string; // e.g. "Behavior: Reading | Reward: Candy"
  count: number; // total relevant points for that group
  unlocked: UnlockedAchievement[]; // Achievements unlocked for this group
  highest: UnlockedAchievement | null | undefined; // the largest threshold unlocked
  nextThreshold: number | undefined; // next threshold after the current count
}

interface Props {
  pointsHistory: PointClient[];
}

export default function AchievementsDashboard({ pointsHistory }: Props) {
  // 1) Convert thresholds to numbers, sorted ascending
  const achievementThresholds = Object.keys(ACHIEVEMENTS)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  // 2) Group points by "itemKey" (could be behavior_name + reward_item_name).
  const groupedByItem = new Map<string, PointClient[]>();

  pointsHistory.forEach((pt) => {
    const keyParts: string[] = [];
    if (pt.behavior_name) keyParts.push(`Behavior: ${pt.behavior_name}`);
    if (pt.reward_item_name) keyParts.push(`Reward: ${pt.reward_item_name}`);

    const itemKey = keyParts.length > 0 ? keyParts.join(" | ") : "No-Item";
    if (!groupedByItem.has(itemKey)) {
      groupedByItem.set(itemKey, []);
    }
    groupedByItem.get(itemKey)!.push(pt);
  });

  // 3) For each group, tally how many "positive/redemption" points were received
  //    and which achievements (thresholds) were unlocked.
  const groupedAchievements: GroupedData[] = Array.from(
    groupedByItem.entries(),
  ).map(([itemKey, itemPoints]) => {
    // Filter only "positive" or "redemption" and sort by date
    const relevantPoints = itemPoints
      .filter((p) => p.type === "positive" || p.type === "redemption")
      .sort(
        (a, b) =>
          new Date(a.created_date).valueOf() -
          new Date(b.created_date).valueOf(),
      );

    let countSoFar = 0;
    const unlocked: UnlockedAchievement[] = [];

    relevantPoints.forEach((pt) => {
      countSoFar++;
      // Check if we hit any threshold exactly
      achievementThresholds.forEach((threshold) => {
        if (countSoFar === threshold) {
          const achData = ACHIEVEMENTS[threshold.toString()];
          if (achData) {
            unlocked.push({
              threshold,
              ...achData,
              behavior_name: pt.behavior_name,
              reward_item_name: pt.reward_item_name,
              created_date: pt.created_date,
            });
          }
        }
      });
    });

    // The highest achievement is the last unlocked (chronologically).
    const highest = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;

    // Find the next threshold (if any).
    const nextThreshold = achievementThresholds.find((t) => t > countSoFar);

    return {
      itemKey,
      count: countSoFar,
      unlocked,
      highest,
      nextThreshold,
    };
  });

  // 4) Check if the user has unlocked ANY achievements across all groups
  const anyAchievements = groupedAchievements.some(
    (g) => g.unlocked.length > 0,
  );
  if (!anyAchievements) {
    return (
      <Card className="mx-auto max-w-2xl bg-white dark:bg-black">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            You haven&apos;t unlocked any achievements yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Keep going to unlock your first achievement!</p>
        </CardContent>
      </Card>
    );
  }

  // 5) For the main card header, let's also compute total achievements unlocked overall
  const totalUnlocked = groupedAchievements.reduce(
    (acc, group) => acc + group.unlocked.length,
    0,
  );

  // --- NEW: Build an array of “highest achievement” per group. ---
  // Then we sort them by threshold descending and pick the top 5 groups.
  const topAchievementsByGroup = groupedAchievements
    .filter((g) => g.highest !== null)
    .map((g) => ({
      // Merge the group’s "highest" achievement data with
      // the group’s overall info (count, itemKey, nextThreshold).
      ...g.highest!,
      itemKey: g.itemKey,
      count: g.count,
      nextThreshold: g.nextThreshold,
    }));

  const topFive = topAchievementsByGroup
    .sort((a, b) => b.threshold - a.threshold)
    .slice(0, 5);

  // Helper: Pick “Received”, “Redeemed”, or “Used” depending on itemKey
  function getUsageLabel(itemKey: string, count: number) {
    const hasBehavior = itemKey.includes("Behavior:");
    const hasReward = itemKey.includes("Reward:");
    let verb = "Used";
    if (hasBehavior && !hasReward) {
      verb = "Received";
    } else if (!hasBehavior && hasReward) {
      verb = "Redeemed";
    }
    return `${verb} ${count} time${count !== 1 ? "s" : ""}`;
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          You&apos;ve unlocked a total of {totalUnlocked} achievement
          {totalUnlocked > 1 ? "s" : ""} across all your behaviors and rewards!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              View All Achievements
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-auto bg-white p-4 dark:bg-black">
            <DialogHeader>
              <DialogTitle>All Achievements</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Each behavior/reward item has its own achievements.
              </DialogDescription>
            </DialogHeader>

            {/* Grid of item-cards */}
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {groupedAchievements.map((group) => {
                // If group has no achievements, show partial card
                if (group.unlocked.length === 0) {
                  return (
                    <Card key={group.itemKey}>
                      <CardHeader>
                        <CardTitle>{group.itemKey}</CardTitle>
                        <CardDescription>
                          0 achievements unlocked yet. Keep going!
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {group.nextThreshold ? (
                          <p>
                            Next achievement unlocks at{" "}
                            <strong>{group.nextThreshold}</strong> total times.
                          </p>
                        ) : (
                          <p>No more achievements to unlock for this item.</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                }

                // If we do have achievements for this item:
                const { highest, unlocked } = group;

                return (
                  <Card key={group.itemKey}>
                    <CardHeader>
                      <CardTitle>{group.itemKey}</CardTitle>
                      <CardDescription>
                        {getUsageLabel(group.itemKey, group.count)}
                        {" — "}unlocked {unlocked.length} achievement
                        {unlocked.length > 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Highest Achievement (Center Stage) */}
                      {highest && (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-semibold">
                            Highest Achievement
                          </span>
                          <FontAwesomeIconClient
                            icon={highest.icon}
                            size={64}
                            className={`${highest.colorClass} animate-pulse`}
                          />
                          <p className="mt-1 text-sm font-medium">
                            {highest.name}
                          </p>
                        </div>
                      )}

                      {/* Next threshold info */}
                      {group.nextThreshold && (
                        <p className="text-xs text-gray-500">
                          Next achievement unlocks at{" "}
                          <strong>{group.nextThreshold}</strong> total. How many
                          more do you need? Can you do that subtraction?
                        </p>
                      )}

                      {/* If you want to list ALL achievements for this item, do so here */}
                      <div className="mt-4 text-xs">
                        <p className="mb-2 font-semibold text-gray-500">
                          All Achievements Earned
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {unlocked.map((ach, index) => (
                            <div
                              key={`${ach.threshold}-${ach.created_date}-${index}`}
                              className="flex items-center space-x-1 rounded border px-2 py-1"
                            >
                              <FontAwesomeIconClient
                                icon={ach.icon}
                                size={12}
                                className={ach.colorClass}
                              />
                              <span>{ach.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        <div>
          <h3 className="text-base font-semibold">Your Top 5 Achievements</h3>
          <div className="mt-2 flex flex-col space-y-2">
            {topFive.map((ach, idx) => {
              return (
                <div
                  key={`${ach.threshold}-${ach.created_date}-${idx}`}
                  className="flex items-center space-x-3 rounded-md border p-2"
                >
                  {/* Icon for the achievement */}
                  <FontAwesomeIconClient
                    icon={ach.icon}
                    size={32}
                    className={ach.colorClass}
                  />

                  {/* Achievement details */}
                  <div className="flex flex-1 flex-col space-y-1">
                    <span className="font-medium">
                      {ach.name} (Threshold: {ach.threshold})
                    </span>
                    {/* The "itemKey" to show which behavior/reward. */}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {ach.itemKey}
                    </span>
                    <div className="text-xs text-gray-500">
                      {getUsageLabel(ach.itemKey, ach.count)}
                      {" — "}
                      {ach.nextThreshold
                        ? `Next achievement at ${ach.nextThreshold} total`
                        : "No more achievements left!"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
