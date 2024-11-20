"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";

interface Params {
  classId: string;
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

  // Behaviors data provided
  const behaviors = [
    {
      behavior_id: "behavior_69323b4e-ffa7-4bf1-b901-09c5ff92dff4",
      name: "Extra Materials, x1",
      point_value: 5,
      description:
        "The student brought extra STEAM materials for another student to use, showing generosity.",
      icon: "fas newspaper",
      color: "#007BFF",
      class_id: "class_baeac0da-8fe6-4f3d-b968-8488fee902a8",
      user_id: "user_2hJQqqywkygYAjPEoAncvveceXL",
      created_date: "2024-11-14 22:23:34",
      updated_date: "2024-11-14 22:23:34",
    },
    // ... (rest of the behaviors)
  ];

  // Calculate total points awarded
  const totalPointsAwarded = (courseData.students ?? []).reduce(
    (acc, student) => {
      const pointsAwarded = (student.point_history ?? []).reduce(
        (sum, point) => sum + (point.quantity > 0 ? point.quantity : 0),
        0,
      );
      return acc + pointsAwarded;
    },
    0,
  );

  // Calculate total points spent
  const totalPointsSpent = (courseData.students ?? []).reduce(
    (acc, student) => {
      const pointsSpent = (student.redemption_history ?? []).reduce(
        (sum, redemption) => sum + redemption.quantity,
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
        (sum, point) => sum + (point.quantity > 0 ? point.quantity : 0),
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
        (sum, redemption) => sum + redemption.quantity,
        0,
      ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate average points per student
  const totalStudents = courseData.students?.length ?? 0;
  const averagePoints =
    totalStudents > 0
      ? Math.round(
          (courseData.students ?? []).reduce(
            (acc, student) => acc + (student.points ?? 0),
            0,
          ) / totalStudents,
        )
      : 0;

  // Aggregate behaviors
  //   const behaviorCounts: Record<string, number> = {};
  //   (courseData.students ?? []).forEach((student) => {
  //     (student.point_history ?? []).forEach((point) => {
  //       const behaviorId = point.behavior_id;
  //       if (behaviorId) {
  //         behaviorCounts[behaviorId] = (behaviorCounts[behaviorId] ?? 0) + 1;
  //       }
  //     });
  //   });

  // Merge behavior counts with behavior details
  //   const behaviorStats = behaviors
  //     .map((behavior) => ({
  //       name: behavior.name,
  //       value: behaviorCounts[behavior.behavior_id] ?? 0,
  //       point_value: behavior.point_value,
  //     }))
  //     .filter((item) => item.value > 0);

  //   // Top positive behaviors
  //   const topPositiveBehaviors = behaviorStats
  //     .filter((item) => item.point_value > 0)
  //     .sort((a, b) => b.value - a.value)
  //     .slice(0, 5);

  //   // Top negative behaviors
  //   const topNegativeBehaviors = behaviorStats
  //     .filter((item) => item.point_value < 0)
  //     .sort((a, b) => b.value - a.value)
  //     .slice(0, 5);

  //   // Total positive behaviors awarded
  //   const totalPositiveBehaviors = behaviorStats
  //     .filter((item) => item.point_value > 0)
  //     .reduce((acc, item) => acc + item.value, 0);

  //   // Total negative behaviors assigned
  //   const totalNegativeBehaviors = behaviorStats
  //     .filter((item) => item.point_value < 0)
  //     .reduce((acc, item) => acc + item.value, 0);

  // Positive to negative ratio
  //   const positiveToNegativeRatio =
  //     totalNegativeBehaviors !== 0
  //       ? (totalPositiveBehaviors / Math.abs(totalNegativeBehaviors)).toFixed(2)
  //       : "N/A";

  return (
    <ContentLayout title="Dashboard">
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
          <StatCard
            title="Average Points"
            value={averagePoints}
            description="Average points per student"
          />
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
        {/* 
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
            value={positiveToNegativeRatio}
            description="Ratio of positive to negative behaviors"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderboardCard
            title="Top Positive Behaviors"
            data={topPositiveBehaviors}
          />
          <LeaderboardCard
            title="Top Negative Behaviors"
            data={topNegativeBehaviors}
          />
        </div> */}
      </div>
    </ContentLayout>
  );
}
