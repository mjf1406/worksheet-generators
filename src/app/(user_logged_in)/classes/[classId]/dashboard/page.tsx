"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import Link from "next/link";

interface Params {
  classId: string;
}

interface DescriptiveStats {
  Mean: number;
  Median: number;
  Mode: string;
  Range: number;
  Max: number;
  Min: number;
  "Standard Deviation": number;
}

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const LeaderboardCard = ({
  title,
  data,
}: {
  title: string;
  data: Array<{ name: string; value: number }>;
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 text-sm font-medium">{index + 1}.</div>
              <div className="text-sm font-medium">{item.name}</div>
            </div>
            <div className="font-mono text-sm">{item.value}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DescriptiveStatsCard = ({
  title,
  stats,
}: {
  title: string;
  stats: DescriptiveStats;
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <div className="text-sm font-semibold">{key}</div>
            <div className="font-mono text-sm">
              {typeof value === "number" ? value.toFixed(2) : value}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function ClassDashboard({ params }: { params: Params }) {
  const classId = params.classId;
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">Error retrieving class data</h1>
        </div>
      </ContentLayout>
    );
  }

  // Get behaviors from courseData.behaviors
  const behaviors = courseData.behaviors ?? [];

  // Get all students' total points
  const studentPoints = (courseData.students ?? []).map(
    (student) => student.points ?? 0,
  );

  // Calculate descriptive statistics for points
  const calculateDescriptiveStats = (data: number[]): DescriptiveStats => {
    const n = data.length;
    if (n === 0) {
      return {
        Mean: 0,
        Median: 0,
        Mode: "N/A",
        Range: 0,
        Max: 0,
        Min: 0,
        "Standard Deviation": 0,
      };
    }

    // Sort the data
    const sortedData = [...data].sort((a, b) => a - b);

    // Mean
    const mean: number = data.reduce((acc, val) => acc + val, 0) / n;

    // Median
    let median: number | undefined;
    if (n % 2 === 0) {
      median = (sortedData[n / 2 - 1]! + sortedData[n / 2]!) / 2;
    } else {
      median = sortedData[Math.floor(n / 2)];
    }

    // Mode
    const frequencyMap: Record<number, number> = {};
    data.forEach((num) => {
      frequencyMap[num] = (frequencyMap[num] ?? 0) + 1;
    });
    const maxFrequency = Math.max(...Object.values(frequencyMap));
    const modes = Object.keys(frequencyMap)
      .filter((key) => frequencyMap[Number(key)] === maxFrequency)
      .map(Number);

    let mode: string;
    if (modes.length === data.length) {
      mode = "No Mode";
    } else {
      mode = modes.join(", ");
    }

    // Range
    const range: number = sortedData[n - 1]! - sortedData[0]!;

    // Max and Min
    const max: number | undefined = sortedData[n - 1];
    const min: number | undefined = sortedData[0];

    // Standard Deviation
    const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
    const standardDeviation = Math.sqrt(variance);

    return {
      Mean: mean,
      Median: median ?? 0,
      Mode: mode,
      Range: range,
      Max: max ?? 0,
      Min: min ?? 0,
      "Standard Deviation": standardDeviation,
    };
  };

  const pointsStats = calculateDescriptiveStats(studentPoints);

  const totalPointsAwarded = (courseData.students ?? []).reduce(
    (acc, student) => {
      const pointsAwarded = (student.point_history ?? []).reduce(
        (sum, point) =>
          sum + (point.number_of_points > 0 ? point.number_of_points : 0),
        0,
      );
      return acc + pointsAwarded;
    },
    0,
  );

  // Calculate total points spent (negative points from redemptions)
  const totalPointsSpent = (courseData.students ?? []).reduce(
    (acc, student) => {
      const pointsSpent = (student.redemption_history ?? []).reduce(
        (sum, redemption) => sum + Math.abs(redemption.quantity),
        0,
      );
      return acc + pointsSpent;
    },
    0,
  );

  // Current points leaderboard
  const currentPointsLeaderboard = (courseData.students ?? [])
    .map((student) => ({
      name: student.student_name_en,
      value: student.points ?? 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Most points earned leaderboard
  const pointsEarnedLeaderboard = (courseData.students ?? [])
    .map((student) => ({
      name: student.student_name_en,
      value: (student.point_history ?? []).reduce(
        (sum, point) =>
          sum + (point.number_of_points > 0 ? point.number_of_points : 0),
        0,
      ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Most points spent leaderboard
  const pointsSpentLeaderboard = (courseData.students ?? [])
    .map((student) => ({
      name: student.student_name_en,
      value: (student.redemption_history ?? []).reduce(
        (sum, redemption) => sum + Math.abs(redemption.quantity),
        0,
      ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Aggregate behaviors
  const behaviorCounts: Record<string, number> = {};
  (courseData.students ?? []).forEach((student) => {
    (student.point_history ?? []).forEach((point) => {
      const behaviorId = point.behavior_id;
      if (behaviorId) {
        behaviorCounts[behaviorId] = (behaviorCounts[behaviorId] ?? 0) + 1;
      }
    });
  });

  // Merge behavior counts with behavior details
  const behaviorStats = behaviors
    .map((behavior) => ({
      name: behavior.name,
      value: behaviorCounts[behavior.behavior_id] ?? 0,
      point_value: behavior.point_value,
    }))
    .filter((item) => item.value > 0);

  // Top positive behaviors
  const topPositiveBehaviors = behaviorStats
    .filter((item) => item.point_value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Top negative behaviors
  const topNegativeBehaviors = behaviorStats
    .filter((item) => item.point_value < 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Total positive behaviors awarded
  const totalPositiveBehaviors = behaviorStats
    .filter((item) => item.point_value > 0)
    .reduce((acc, item) => acc + item.value, 0);

  // Total negative behaviors assigned
  const totalNegativeBehaviors = behaviorStats
    .filter((item) => item.point_value < 0)
    .reduce((acc, item) => acc + item.value, 0);

  // Positive to negative ratio
  const positiveToNegativeRatio =
    totalNegativeBehaviors !== 0
      ? (totalPositiveBehaviors / Math.abs(totalNegativeBehaviors)).toFixed(2)
      : totalPositiveBehaviors > 0
        ? "Infinity"
        : "N/A";

  // Most Absent Students Leaderboard
  const mostAbsentStudents = (courseData.students ?? [])
    .map((student) => ({
      name: student.student_name_en,
      value: student.absent_dates?.length ?? 0,
    }))
    .sort((a, b) => b.value - a.value)
    .filter((student) => student.value > 0) // Exclude students with zero absences
    .slice(0, 5);

  return (
    <ContentLayout title="Class Dashboard">
      <div className="container space-y-8 px-4 py-4">
        <div className="text-2xl font-bold">Class {courseData.class_name}</div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Points Awarded"
            value={totalPointsAwarded}
            description="Total positive points given to students"
          />
          <StatCard
            title="Total Points Spent"
            value={totalPointsSpent}
            description="Points redeemed on rewards"
          />
          <DescriptiveStatsCard title="Points Statistics" stats={pointsStats} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <LeaderboardCard
            title="Current Points Leaders"
            data={currentPointsLeaderboard}
          />
          <LeaderboardCard
            title="Most Points Earned"
            data={pointsEarnedLeaderboard}
          />
          <LeaderboardCard
            title="Most Points Spent"
            data={pointsSpentLeaderboard}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Positive Behaviors Awarded"
            value={totalPositiveBehaviors}
            description="Total number of positive behaviors awarded"
          />
          <StatCard
            title="Total Negative Behaviors Assigned"
            value={totalNegativeBehaviors}
            description="Total number of negative behaviors assigned"
          />
          <StatCard
            title="Positive to Negative Ratio"
            value={`${positiveToNegativeRatio} : 1`}
            description={`For every 1 negative point, ${positiveToNegativeRatio} positive points are awarded.`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderboardCard
            title="Top Positive Behaviors"
            data={topPositiveBehaviors.map((item) => ({
              name: item.name,
              value: item.value,
            }))}
          />
          <LeaderboardCard
            title="Top Negative Behaviors"
            data={topNegativeBehaviors.map((item) => ({
              name: item.name,
              value: item.value,
            }))}
          />
        </div>

        {/* Most Absent Students Leaderboard */}
        <div className="grid gap-4 md:grid-cols-1">
          <LeaderboardCard
            title="Most Absent Students"
            data={mostAbsentStudents}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Students</h2>
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-6 xl:grid-cols-8">
            {(courseData.students ?? [])
              .slice()
              .sort((a, b) => {
                const nameA = a.student_name_en.split(" ")[1]!.toLowerCase();
                const nameB = b.student_name_en.split(" ")[1]!.toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((student) => (
                <Link
                  key={student.student_id}
                  href={`/classes/${courseData.class_id}/dashboard/${student.student_id}`}
                  legacyBehavior
                >
                  <a>
                    <Card className="transition-shadow hover:shadow-lg">
                      <CardContent className="flex flex-col items-center justify-center p-2">
                        <div className="text-xs font-medium md:text-base">
                          {student.student_name_en.split(" ")[1]}
                        </div>
                        <div className="text-xs md:text-base">
                          {student.points ?? 0}
                        </div>
                        {/* You can display additional student info here */}
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
