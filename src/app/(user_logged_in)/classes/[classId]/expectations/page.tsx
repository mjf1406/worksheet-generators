"use client";

import React, { useState, useMemo } from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import Link from "next/link";
import { ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { CreateExpectationDialog } from "./components/CreateExpectationDialog";

// Import shadcn UI components
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

interface Params {
  classId: string;
}

type SortOrder = "asc" | "desc" | null;
type SortBy = "number" | "name" | null;

export default function Expectations({ params }: { params: Params }) {
  const classId = params.classId;
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);
  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, string>>
  >({});

  // Sorting state
  const [sortBy, setSortBy] = useState<SortBy>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // useMemo is now called unconditionally
  const sortedStudents = useMemo(() => {
    if (!courseData) return [];

    const { expectations, students = [] } = courseData;

    if (!sortBy || !sortOrder) return students;

    const sorted = [...students].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (sortBy === "number") {
        aValue = a.student_number ?? 0;
        bValue = b.student_number ?? 0;
      } else if (sortBy === "name") {
        aValue = a.student_name_en.split(" ")[1] ?? a.student_name_en;
        bValue = b.student_name_en.split(" ")[1] ?? b.student_name_en;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      // For string comparison
      return sortOrder === "asc"
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });

    return sorted;
  }, [courseData, sortBy, sortOrder]);

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">
            Error retrieving class data. Please refresh the page to try again.
          </h1>
        </div>
      </ContentLayout>
    );
  }

  const { expectations, students } = courseData;

  const handleInputChange = (
    studentId: string,
    expectationId: string,
    value: string,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [expectationId]: value,
      },
    }));
  };

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Function to render sort icons
  const renderSortIcon = (column: SortBy) => {
    if (sortBy !== column) return null;
    if (sortOrder === "asc") {
      return <ArrowUp className="ml-1 inline h-4 w-4" />;
    }
    if (sortOrder === "desc") {
      return <ArrowDown className="ml-1 inline h-4 w-4" />;
    }
    return null;
  };

  return (
    <ContentLayout title="Expectations">
      <div className="container flex flex-col items-center gap-4 px-4 py-4">
        <div className="flex w-full flex-col gap-4">
          <div className="semi-bold flex w-full items-center justify-between gap-2 self-start text-left text-3xl">
            <div className="flex items-center justify-center gap-2">
              <Link
                className="font-extrabold text-primary hover:underline"
                href={`/classes/${classId}`}
              >
                {courseData.class_name}
              </Link>
              <ChevronRight />
              Expectations
            </div>
            <CreateExpectationDialog classId={classId} />
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full border">
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead
                  className="cursor-pointer items-center justify-between text-foreground"
                  onClick={() => handleSort("number")}
                >
                  Number {renderSortIcon("number")}
                </TableHead>
                <TableHead
                  className="cursor-pointer items-center justify-center text-foreground"
                  onClick={() => handleSort("name")}
                >
                  Student {renderSortIcon("name")}
                </TableHead>
                {expectations.map((expectation) => (
                  <TableHead key={expectation.id} className="text-foreground">
                    {expectation.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student: StudentData) => (
                <TableRow key={student.student_id}>
                  <TableCell className="font-medium">
                    {student.student_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.student_name_en.split(" ")[1] ??
                      student.student_name_en}
                  </TableCell>
                  {expectations.map((expectation) => (
                    <TableCell key={expectation.id}>
                      <Input
                        value={
                          inputValues[student.student_id]?.[expectation.id] ??
                          ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            student.student_id,
                            expectation.id,
                            e.target.value,
                          )
                        }
                        placeholder={`Enter value`}
                        className="w-full"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ContentLayout>
  );
}
