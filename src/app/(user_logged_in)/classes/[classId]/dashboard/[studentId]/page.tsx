"use client";

import React, { useState } from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "~/components/ui/table"; // Importing shadcn table components
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";

interface Params {
  classId: string;
  studentId: string;
}

const ITEMS_PER_PAGE = 10; // Number of items per page

export default function StudentDashboard({ params }: { params: Params }) {
  const classId = params.classId;
  const studentId = params.studentId;
  const [pointCurrentPage, setPointCurrentPage] = useState(1);
  const [redemptionCurrentPage, setRedemptionCurrentPage] = useState(1);
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

  // Find the student data
  const student = courseData.students?.find((s) => s.student_id === studentId);

  if (!student) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">Student not found</h1>
        </div>
      </ContentLayout>
    );
  }

  // Get student's point history
  const pointHistory = student.point_history ?? [];
  const redemptionHistory = student.redemption_history ?? [];

  // Aggregate points by behavior
  const behaviorCounts: Record<string, { name: string; count: number }> = {};
  const behaviors = courseData.behaviors ?? [];

  pointHistory.forEach((point) => {
    const behavior = behaviors.find((b) => b.behavior_id === point.behavior_id);
    if (behavior) {
      const behaviorName = behavior.name;
      if (!behaviorCounts[behavior.behavior_id]) {
        behaviorCounts[behavior.behavior_id] = {
          name: behaviorName,
          count: 1,
        };
      } else {
        behaviorCounts[behavior.behavior_id]!.count += 1;
      }
    }
  });

  // Convert behaviorCounts to array
  const behaviorStats = Object.values(behaviorCounts).sort(
    (a, b) => b.count - a.count,
  );

  // Total positive and negative points
  const totalPositivePoints = pointHistory
    .filter((p) => p.type === "positive")
    .reduce((sum, p) => sum + p.number_of_points, 0);

  const totalNegativePoints = pointHistory
    .filter((p) => p.type === "negative")
    .reduce((sum, p) => sum + p.number_of_points, 0);

  // Pagination States

  // Pagination Logic for Point History
  const pointTotalPages = Math.ceil(pointHistory.length / ITEMS_PER_PAGE);
  const pointStartIndex = (pointCurrentPage - 1) * ITEMS_PER_PAGE;
  const pointEndIndex = pointStartIndex + ITEMS_PER_PAGE;
  const currentPointHistory = pointHistory
    .filter((i) => i.type === "negative" || i.type === "positive")
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime(),
    )
    .slice(pointStartIndex, pointEndIndex);

  // Pagination Logic for Redemption History
  const redemptionTotalPages = Math.ceil(
    redemptionHistory.length / ITEMS_PER_PAGE,
  );
  const redemptionStartIndex = (redemptionCurrentPage - 1) * ITEMS_PER_PAGE;
  const redemptionEndIndex = redemptionStartIndex + ITEMS_PER_PAGE;
  const currentRedemptionHistory = redemptionHistory
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(redemptionStartIndex, redemptionEndIndex);

  // Handler Functions
  const handlePointPageChange = (page: number) => {
    setPointCurrentPage(page);
  };

  const handleRedemptionPageChange = (page: number) => {
    setRedemptionCurrentPage(page);
  };

  // Utility function to render pagination controls
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="mt-4 flex justify-center space-x-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`rounded px-3 py-1 ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-300"
              : "bg-accent hover:bg-accent/90"
          }`}
        >
          Previous
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded px-3 py-1 ${
              page === currentPage
                ? "bg-primary"
                : "bg-accent hover:bg-accent/90"
            }`}
          >
            {page}
          </Button>
        ))}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`rounded px-3 py-1 ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-300"
              : "bg-accent hover:bg-accent/90"
          }`}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <ContentLayout
      title={`${student.student_name_first_en} ${student?.student_name_last_en}'s Dashboard`}
    >
      <div className="container space-y-8 px-4 py-4">
        {/* Student Info */}
        <div className="flex items-center space-x-4">
          {/* You can add an avatar or image here if available */}
          <div>
            <h1 className="text-3xl font-bold">
              {student.student_name_first_en} {student.student_name_last_en} (
              {student.student_name_alt})
            </h1>
            <p className="text-sm text-muted-foreground">
              Grade: {student.student_grade} | Sex: {student.student_sex} |
              Student Number: {student.student_number}
            </p>
          </div>
        </div>

        {/* Points Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.points ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Positive Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPositivePoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Negative Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNegativePoints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Behavior Stats */}
        <div>
          <h2 className="text-xl font-bold">Behavior Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {behaviorStats.map((behavior) => (
              <Card key={behavior.name}>
                <CardHeader>
                  <CardTitle>{behavior.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{behavior.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Point History */}
        <div>
          <h2 className="text-xl font-bold">Point History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Behavior</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPointHistory.length > 0 ? (
                currentPointHistory.map((point) => {
                  const behavior = behaviors.find(
                    (b) => b.behavior_id === point.behavior_id,
                  );
                  return (
                    <TableRow key={point.id}>
                      <TableCell>
                        {behavior ? behavior.name : "Custom Point Adjustment"}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(point.created_date),
                          "yyyy-MM-dd HH:mm",
                        )}
                      </TableCell>
                      <TableCell
                        className={`font-bold ${
                          point.number_of_points > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {point.number_of_points > 0 ? "+" : ""}
                        {point.number_of_points}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No point history available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {/* Optional: Add TableCaption if needed */}
            {/* <TableCaption>Point history records.</TableCaption> */}
          </Table>
          {/* Pagination Controls for Point History */}
          {renderPagination(
            pointCurrentPage,
            pointTotalPages,
            handlePointPageChange,
          )}
        </div>

        {/* Redemption History */}
        <div>
          <h2 className="text-xl font-bold">Redemption History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRedemptionHistory.length > 0 ? (
                currentRedemptionHistory.map((redemption, index) => {
                  const rewardItem = courseData.reward_items?.find(
                    (item) => item.item_id === redemption.item_id,
                  );
                  return (
                    <TableRow key={`${redemption.item_id}-${index}`}>
                      <TableCell>
                        {rewardItem ? rewardItem.name : "Unknown Reward"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(redemption.date), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="font-bold text-red-500">
                        -{Math.abs(redemption.quantity)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No redemption history available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {/* Optional: Add TableCaption if needed */}
            {/* <TableCaption>Redemption history records.</TableCaption> */}
          </Table>
          {/* Pagination Controls for Redemption History */}
          {renderPagination(
            redemptionCurrentPage,
            redemptionTotalPages,
            handleRedemptionPageChange,
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
