"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";
import SpinningWheel, { type WheelItem } from "./components/SpinningWheel";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import type { Course } from "~/server/db/types";

const RandomizerClient = () => {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery<Course[], Error>({
    queryKey: ["courses"],
    queryFn: fetchClassesGroupsStudents,
  });

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [randomizationType, setRandomizationType] = useState<
    "course" | "group" | "studentInCourse" | "studentInGroup"
  >();
  const [randomResult, setRandomResult] = useState("");

  const wheelItems = useMemo(() => {
    if (!courses) return [];

    switch (randomizationType) {
      case "course":
        return courses.map((c) => c.class_name ?? "Unnamed Course");
      case "group":
        return selectedCourse
          ? (courses
              .find((c) => c.class_id === selectedCourse)
              ?.groups?.map((g) => g.group_name) ?? [])
          : [];
      case "studentInCourse":
        return selectedCourse
          ? (courses
              .find((c) => c.class_id === selectedCourse)
              ?.students.map(
                (s) =>
                  s.student_name_first_en ??
                  s.student_name_alt ??
                  "Unnamed Student",
              ) ?? [])
          : [];
      case "studentInGroup":
        return selectedCourse && selectedGroup
          ? (courses
              .find((c) => c.class_id === selectedCourse)
              ?.groups?.find((g) => g.group_id === selectedGroup)
              ?.students.map(
                (s) =>
                  s.student_name_first_en ??
                  s.student_name_alt ??
                  "Unnamed Student",
              ) ?? [])
          : [];
      default:
        return [];
    }
  }, [courses, selectedCourse, selectedGroup, randomizationType]);

  const handleSelectItem = (item: WheelItem) => {
    let detailedResult = "";
    switch (randomizationType) {
      case "course":
        const selectedCourseData = courses?.find((c) => c.class_name === item);
        detailedResult = `Course: ${item}\nGrade: ${selectedCourseData?.class_grade}\nYear: ${selectedCourseData?.class_year}`;
        break;
      case "group":
        const groupData = courses
          ?.find((c) => c.class_id === selectedCourse)
          ?.groups?.find((g) => g.group_name === item);
        detailedResult = `Group: ${item}\nStudents: ${groupData?.students.length}`;
        break;
      case "studentInCourse":
      case "studentInGroup":
        const studentData = courses
          ?.find((c) => c.class_id === selectedCourse)
          ?.students.find(
            (s) =>
              s.student_name_first_en === item || s.student_name_alt === item,
          );
        detailedResult = `Student: ${item}\nGrade: ${studentData?.student_grade}\nReading Level: ${studentData?.student_reading_level}`;
        break;
    }
    setRandomResult(detailedResult);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-2xl">Loading...</div>
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-5 flex w-full flex-col items-center gap-4">
      <div id="collapsible"></div>
      <div className="flex w-full max-w-md flex-col gap-4">
        <p className="max-w-lg text-muted opacity-90">
          Looking for a way to quickly order students/groups/classes while
          ensuring each item goes first and last at least once before letting
          any repeats occur? Use{" "}
          <Link className="underline" href={"/tools/shuffler"}>
            Shuffler
          </Link>
          .
        </p>
        <Select onValueChange={(value) => setSelectedCourse(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((course) => (
              <SelectItem key={course.class_id} value={course.class_id ?? ""}>
                {course.class_name ?? "Unnamed Course"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCourse && (
          <Select onValueChange={(value) => setSelectedGroup(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {courses
                ?.find((c) => c.class_id === selectedCourse)
                ?.groups?.map((group) => (
                  <SelectItem key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
        <Select
          onValueChange={(
            value: "course" | "group" | "studentInCourse" | "studentInGroup",
          ) => setRandomizationType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select what to randomize" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="course">Random class</SelectItem>
            <SelectItem value="group">Random group</SelectItem>
            <SelectItem value="studentInCourse">
              Random student in class
            </SelectItem>
            <SelectItem value="studentInGroup">
              Random student in group
            </SelectItem>
          </SelectContent>
        </Select>
        {wheelItems.length > 0 ? (
          <></>
        ) : (
          <p className="text-destructive">
            Please select the appropriate options to spin the wheel.
          </p>
        )}
      </div>
      <div>
        {wheelItems.length > 0 ? (
          <SpinningWheel items={wheelItems} onSelectItem={handleSelectItem} />
        ) : (
          <></>
        )}
        {/* {randomResult && (
          <div className="mt-4 whitespace-pre-line rounded-md bg-foreground/5 p-4 text-foreground">
            <p>{randomResult}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default RandomizerClient;
