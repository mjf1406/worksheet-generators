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
import fetchClassesGroupsStudents from "~/app/api/fetches";
import type { Course } from "~/server/db/types";
import AnimatedShuffle from "./components/AnimatedShuffle";
import AnimatedShuffle2 from "./components/AnimatedShuffle2";

const ShufflerClient = () => {
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
  const [shuffleMode, setShuffleMode] = useState<
    "course" | "group" | "studentInCourse" | "studentInGroup" | null
  >(null);
  const [shuffleResult, setShuffleResult] = useState<string[]>([]);

  const itemsToShuffle = useMemo(() => {
    if (!courses) return [];

    switch (shuffleMode) {
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
  }, [courses, selectedCourse, selectedGroup, shuffleMode]);

  const handleShuffleComplete = (shuffled: (string | number)[]) => {
    const result = shuffled.map((item) => item.toString());
    setShuffleResult(result);
    console.log("Shuffle result:", result);
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
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex w-full max-w-md flex-col gap-4">
        <p className="max-w-lg text-muted opacity-90">
          Looking for a way to quickly pick a random student/group/class? Use{" "}
          <Link className="underline" href={"/tools/randomizer"}>
            Randomizer
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
          ) => setShuffleMode(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select what to shuffle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="course">Shuffle classes</SelectItem>
            <SelectItem value="group">Shuffle groups</SelectItem>
            <SelectItem value="studentInCourse">
              Shuffle students in class
            </SelectItem>
            <SelectItem value="studentInGroup">
              Shuffle students in group
            </SelectItem>
          </SelectContent>
        </Select>
        {itemsToShuffle.length > 0 ? (
          <></>
        ) : (
          <p className="text-destructive">
            Please select the appropriate options to shuffle.
          </p>
        )}
      </div>
      {/* <div className="grid grid-cols-2"> */}
      <div className="">
        {/* <div className="col-span-1">
          {itemsToShuffle.length > 0 && (
            <AnimatedShuffle
              items={itemsToShuffle}
              onShuffleComplete={handleShuffleComplete}
            />
          )}
        </div> */}
        <div className="col-span-1">
          {itemsToShuffle.length > 0 && (
            <AnimatedShuffle2
              items={itemsToShuffle}
              onShuffleComplete={handleShuffleComplete}
            />
          )}
        </div>
        {/* {shuffleResult.length > 0 && (
          <div className="mt-4 rounded-md bg-foreground/5 p-4">
            <h3 className="mb-2 font-semibold">Shuffle Result:</h3>
            <ol className="list-decimal pl-5">
              {shuffleResult.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ShufflerClient;
