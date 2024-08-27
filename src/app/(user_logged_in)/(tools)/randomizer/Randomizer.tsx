"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import { Loader2 } from "lucide-react";

// Define types for your data structure
type Student = {
  student_id: string;
  student_name_en: string;
  // Add other student properties as needed
};

type Group = {
  group_id: string;
  group_name: string;
  students: Student[];
};

type Class = {
  class_id: string;
  class_name: string;
  groups: Group[];
};

const Randomizer = () => {
  const {
    data: classes,
    isLoading,
    error,
  } = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [randomResult, setRandomResult] = useState("");
  const [isError, setIsError] = useState(false);

  const getRandomItem = <T,>(array: T[]): T | undefined => {
    return array.length > 0
      ? array[Math.floor(Math.random() * array.length)]
      : undefined;
  };

  const setResult = (message: string, error = false) => {
    setRandomResult(message);
    setIsError(error);
  };

  const randomizeClass = () => {
    if (classes && classes.length > 0) {
      const randomClass = getRandomItem(classes);
      setResult(`Random Class: ${randomClass?.class_name}`);
    } else {
      setResult("No classes available.", true);
    }
  };

  const randomizeGroup = () => {
    if (selectedClass) {
      const classData = classes?.find((c) => c.class_id === selectedClass);
      if (classData && classData.groups.length > 0) {
        const randomGroup = getRandomItem(classData.groups);
        setResult(`Random Group: ${randomGroup?.group_name}`);
      } else {
        setResult("No groups available in the selected class.", true);
      }
    } else {
      setResult("Please select a class first.", true);
    }
  };

  const randomizeStudentInGroup = () => {
    if (selectedClass && selectedGroup) {
      const classData = classes?.find((c) => c.class_id === selectedClass);
      const groupData = classData?.groups.find(
        (g) => g.group_id === selectedGroup,
      );
      if (groupData && groupData.students.length > 0) {
        const randomStudent = getRandomItem(groupData.students);
        setResult(`Random Student: ${randomStudent?.student_name_en}`);
      } else {
        setResult("No students available in the selected group.", true);
      }
    } else {
      setResult("Please select both a class and a group.", true);
    }
  };

  const randomizeStudentInClass = () => {
    if (selectedClass) {
      const classData = classes?.find((c) => c.class_id === selectedClass);
      if (classData) {
        const allStudents = classData.groups.flatMap((group) => group.students);
        if (allStudents.length > 0) {
          const randomStudent = getRandomItem(allStudents);
          setResult(`Random Student: ${randomStudent?.student_name_en}`);
        } else {
          setResult("No students available in the selected class.", true);
        }
      }
    } else {
      setResult("Please select a class first.", true);
    }
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
    <div className="mt-5 flex w-full flex-col items-center justify-center gap-4">
      <p className="max-w-xl">
        Looking for a way to omit students/groups/classes that have already been
        picked? Use{" "}
        <Link className="underline" href={"/shuffler"}>
          Shuffler
        </Link>
        .
      </p>
      <div className="flex w-full max-w-md flex-col gap-4">
        <Select onValueChange={(value) => setSelectedClass(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((classItem) => (
              <SelectItem key={classItem.class_id} value={classItem.class_id}>
                {classItem.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClass && (
          <Select onValueChange={(value) => setSelectedGroup(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {classes
                ?.find((c) => c.class_id === selectedClass)
                ?.groups.map((group) => (
                  <SelectItem key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={randomizeClass}>Random Class</Button>
          <Button onClick={randomizeGroup}>Random Group</Button>
          <Button onClick={randomizeStudentInGroup}>
            Random Student in Group
          </Button>
          <Button onClick={randomizeStudentInClass}>
            Random Student in Class
          </Button>
        </div>
        {randomResult && (
          <div
            className={`mt-4 rounded-md bg-foreground/5 p-4 ${isError ? "text-destructive" : "text-foreground"}`}
          >
            <p>{randomResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Randomizer;
