"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import { Loader2 } from "lucide-react";

// TODO: ensure shuffleHistory is stored in the DB so it can persists across sessions
type Student = {
  student_id: string;
  student_name_en: string;
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

const Shuffler = () => {
  const {
    data: classes,
    isLoading,
    error,
  } = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [shuffleResult, setShuffleResult] = useState<string[]>([]);
  const [shuffleHistory, setShuffleHistory] = useState<string[][]>([]);

  const currentClass = classes?.find((c) => c.class_id === selectedClass);
  const allGroups = currentClass?.groups ?? [];
  const allStudents = currentClass?.groups.flatMap((g) => g.students) ?? [];

  const areAllGroupsSelected =
    allGroups.length > 0 && selectedGroups.length === allGroups.length;
  const areAllStudentsSelected =
    allStudents.length > 0 && selectedStudents.length === allStudents.length;

  const toggleAllGroups = () => {
    if (areAllGroupsSelected) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(allGroups.map((g) => g.group_id));
    }
  };

  const toggleAllStudents = () => {
    if (areAllStudentsSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudents.map((s) => s.student_id));
    }
  };

  const toggleGroup = (groupId: string, checked: boolean) => {
    let newSelectedGroups: string[];
    let newSelectedStudents: string[];

    if (checked) {
      newSelectedGroups = [...selectedGroups, groupId];
      const groupStudents =
        allGroups.find((g) => g.group_id === groupId)?.students ?? [];
      newSelectedStudents = [
        ...new Set([
          ...selectedStudents,
          ...groupStudents.map((s) => s.student_id),
        ]),
      ];
    } else {
      newSelectedGroups = selectedGroups.filter((id) => id !== groupId);
      const otherGroupStudents = allGroups
        .filter(
          (g) =>
            g.group_id !== groupId && newSelectedGroups.includes(g.group_id),
        )
        .flatMap((g) => g.students)
        .map((s) => s.student_id);
      newSelectedStudents = [...new Set(otherGroupStudents)];
    }

    setSelectedGroups(newSelectedGroups);
    setSelectedStudents(newSelectedStudents);
  };

  const toggleStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i in shuffled && j in shuffled) {
        const temp = shuffled[i]!;
        shuffled[i] = shuffled[j]!;
        shuffled[j] = temp;
      }
    }
    return shuffled;
  };

  const fairShuffle = <T extends string>(items: T[]): T[] => {
    if (shuffleHistory.length === 0) {
      const newShuffle = shuffle(items);
      setShuffleHistory([newShuffle]);
      return newShuffle;
    }

    const lastShuffle = shuffleHistory[shuffleHistory.length - 1];
    if (lastShuffle) {
      const newShuffle = shuffle(
        items.filter(
          (item) =>
            item !== lastShuffle[0] &&
            item !== lastShuffle[lastShuffle.length - 1],
        ),
      );
      const result: T[] = [
        lastShuffle[lastShuffle.length - 1],
        ...newShuffle,
        lastShuffle[0],
      ].filter((item): item is T => item !== undefined);
      setShuffleHistory([...shuffleHistory, result]);
      return result;
    }
    return shuffle(items);
  };

  const shuffleClasses = () => {
    if (classes) {
      const shuffled = fairShuffle(classes.map((c) => c.class_name));
      setShuffleResult(shuffled);
    }
  };

  const shuffleGroups = () => {
    if (selectedClass && classes) {
      const classData = classes.find((c) => c.class_id === selectedClass);
      if (classData) {
        const groups = classData.groups.filter((g) =>
          selectedGroups.includes(g.group_id),
        );
        const shuffled = fairShuffle(groups.map((g) => g.group_name));
        setShuffleResult(shuffled);
      }
    }
  };

  const shuffleStudents = () => {
    if (selectedClass && classes) {
      const classData = classes.find((c) => c.class_id === selectedClass);
      if (classData) {
        let studentsToShuffle: Student[] = [];
        if (selectedGroups.length > 0) {
          studentsToShuffle = classData.groups
            .filter((g) => selectedGroups.includes(g.group_id))
            .flatMap((g) => g.students)
            .filter((s) => selectedStudents.includes(s.student_id));
        } else {
          studentsToShuffle = classData.groups
            .flatMap((g) => g.students)
            .filter((s) => selectedStudents.includes(s.student_id));
        }
        const shuffled = fairShuffle(
          studentsToShuffle.map((s) => s.student_name_en),
        );
        setShuffleResult(shuffled);
      }
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
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Select Groups:</h3>
                <Button onClick={toggleAllGroups} variant="outline" size="sm">
                  {areAllGroupsSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>
              {allGroups.map((group) => (
                <div
                  key={group.group_id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={group.group_id}
                    checked={selectedGroups.includes(group.group_id)}
                    onCheckedChange={(checked) =>
                      toggleGroup(group.group_id, checked === true)
                    }
                  />
                  <label htmlFor={group.group_id}>{group.group_name}</label>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Select Students:</h3>
                <Button onClick={toggleAllStudents} variant="outline" size="sm">
                  {areAllStudentsSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-3">
                {allStudents.map((student) => (
                  <div
                    key={student.student_id}
                    className="col-span-1 flex items-center space-x-2"
                  >
                    <Checkbox
                      id={student.student_id}
                      checked={selectedStudents.includes(student.student_id)}
                      onCheckedChange={(checked) =>
                        toggleStudent(student.student_id, checked === true)
                      }
                    />
                    <label htmlFor={student.student_id}>
                      {student.student_name_en}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={shuffleClasses}>Shuffle Classes</Button>
          <Button
            onClick={shuffleGroups}
            disabled={!selectedClass || selectedGroups.length === 0}
          >
            Shuffle Groups
          </Button>
          <Button
            onClick={shuffleStudents}
            disabled={!selectedClass || selectedStudents.length === 0}
          >
            Shuffle Students
          </Button>
        </div>
        {shuffleResult.length > 0 && (
          <div className="mt-4 rounded-md bg-foreground/5 p-4">
            <h3 className="mb-2 font-semibold">Shuffle Result:</h3>
            <ol className="list-decimal pl-5">
              {shuffleResult.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shuffler;
