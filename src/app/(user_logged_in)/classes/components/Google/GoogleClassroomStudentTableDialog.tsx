"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "~/components/ui/use-toast";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GoogleClassOptions } from "~/app/api/queryOptions";
import insertClass, { type ClassGrade } from "~/server/actions/insertClass";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type {
  GoogleClassroom,
  GoogleClassroomStudent,
} from "~/app/api/GoogleClasses/route";
import { Loader2 } from "lucide-react";

const SORT_OPTIONS = [
  { value: "lastNameAsc", label: "Alphabetical by Last Name (A-Z)" },
  { value: "lastNameDesc", label: "Alphabetical by Last Name (Z-A)" },
  { value: "firstNameAsc", label: "Alphabetical by First Name (A-Z)" },
  { value: "firstNameDesc", label: "Alphabetical by First Name (Z-A)" },
];

export default function GoogleClassroomStudentTableDialog({
  open,
  onClose,
  selectedCourseId,
  classGrade, // <-- NEW
  classYear, // <-- NEW
}: {
  open: boolean;
  onClose: () => void;
  selectedCourseId?: string;
  classGrade: ClassGrade;
  classYear?: string;
}) {
  const { data: coursesResponse = [] } = useSuspenseQuery(GoogleClassOptions);
  const courses = Array.isArray(coursesResponse) ? coursesResponse : [];

  // 1. Identify selected course
  const selectedCourse: GoogleClassroom | undefined = useMemo(() => {
    return courses.find((course) => course.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  // 2. State for student data
  const [studentData, setStudentData] = useState<
    {
      name_first_en: string;
      name_last_en: string;
      fullName: string;
      studentNumber: string;
      email: string;
    }[]
  >([]);

  // 3. Sorting
  const [sortOption, setSortOption] = useState("firstNameAsc");
  const sortStudents = useCallback(
    (students: GoogleClassroomStudent[]): GoogleClassroomStudent[] => {
      const sorted = [...students];
      sorted.sort((a, b) => {
        let aValue = "";
        let bValue = "";
        switch (sortOption) {
          case "lastNameAsc":
            aValue = a.profile.name.familyName || "";
            bValue = b.profile.name.familyName || "";
            return aValue.localeCompare(bValue);
          case "lastNameDesc":
            aValue = a.profile.name.familyName || "";
            bValue = b.profile.name.familyName || "";
            return bValue.localeCompare(aValue);
          case "firstNameAsc":
            aValue = a.profile.name.givenName || "";
            bValue = b.profile.name.givenName || "";
            return aValue.localeCompare(bValue);
          case "firstNameDesc":
            aValue = a.profile.name.givenName || "";
            bValue = b.profile.name.givenName || "";
            return bValue.localeCompare(aValue);
          default:
            return 0;
        }
      });
      return sorted;
    },
    [sortOption],
  );

  // 4. Initialize student data once selectedCourse changes
  useEffect(() => {
    if (!selectedCourse) return;
    const sortedStudents = sortStudents(selectedCourse.students);

    // For each student, generate an auto-assigned number 1..N
    const initialStudentData = sortedStudents.map((student, index) => ({
      fullName: student.profile.name.fullName,
      studentNumber: String(index + 1),
      name_first_en: student.profile.name.givenName,
      name_last_en: student.profile.name.familyName,
      email: student.profile.emailAddress ?? null,
    }));

    setStudentData(initialStudentData);
  }, [selectedCourse, sortStudents]);

  // 5. Handler for editing the studentNumber in the table
  const handleStudentNumberChange = (idx: number, value: string) => {
    setStudentData((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, studentNumber: value } : row,
      ),
    );
  };

  // 6. Insert the class on confirm
  const { userId } = useAuth();
  const { toast } = useToast();

  // **New: Loading state**
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to perform this action.",
      });
      return;
    }
    if (!selectedCourse) {
      console.error("No course selected.");
      toast({
        variant: "destructive",
        title: "Course Selection Error",
        description:
          "No course selected. Please select a course and try again.",
      });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Generate CSV: required columns: number,sex,name_en,name_alt,grade,reading_level,email
      const lines = [
        "number,sex,name_first_en,name_]ast_en,name_alt,grade,reading_level,email",
      ];
      for (const student of studentData) {
        const number = student.studentNumber; // from state
        const sex = ""; // unknown => placeholder
        const name_en = student.fullName; // from GClass
        const name_first_en = student.name_first_en;
        const name_last_en = student.name_last_en;
        const name_alt = "N/A"; // placeholder
        // Use the parent's classGrade & classYear
        const grade = classGrade ?? "1";
        const reading_level = "0"; // placeholder
        const email = student.email ?? null;

        lines.push(
          `${number},${sex},${name_first_en},${name_last_en},${name_alt},${grade},${reading_level},${email}`,
        );
      }
      const fileContents = lines.join("\n");

      await insertClass(
        {
          class_id: undefined,
          class_name: selectedCourse.name ?? "Untitled Google Class",
          class_language: "en-US", // or you can pass this down too, if you prefer
          class_grade: classGrade ?? "1", // from parent
          class_year: classYear ?? "2024", // from parent
          role: "primary",
          fileContents,
        },
        userId,
        false,
        "google-classroom",
      );

      toast({
        title: "Success!",
        description: `${selectedCourse.name} was successfully imported.`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to insert class from Google Classroom:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description:
          "Failed to import this Google Classroom. Please try again.",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="absolute flex h-screen flex-col p-6 sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Review & Edit Students</DialogTitle>
          <DialogDescription>
            We found {studentData.length} student(s) in this Google Classroom.
            Please review or edit their numbers below.
          </DialogDescription>
        </DialogHeader>

        {/* Sorting Dropdown */}
        <div className="mt-4">
          <label
            htmlFor="sort"
            className="block text-sm font-medium text-gray-700"
          >
            Sort Students By:
          </label>
          <select
            id="sort"
            name="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="mt-1 block w-64 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table of Students */}
        <div className="mt-4 flex-1 overflow-auto">
          <table className="w-full min-w-[300px] table-auto border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 font-semibold">Full Name</th>
                <th className="p-2 font-semibold">Student Number</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2 align-middle">{row.fullName}</td>
                  <td className="p-2 align-middle">
                    <Input
                      type="text"
                      value={row.studentNumber}
                      onChange={(e) =>
                        handleStudentNumberChange(idx, e.target.value)
                      }
                      className="w-24"
                      disabled={isLoading} // Disable input while loading
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          {/* Now calling our handleConfirm with loading state */}
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="animate-spin" size={16} />
                Confirming...
              </span>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
