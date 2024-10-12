import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { BookOpen, CheckSquare, Edit, ListChecks } from "lucide-react";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { FancyRadioGroup, type Option } from "./SelectRadioGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SortingState = "student_number" | "last_name" | "first_name" | "points";

export type GroupData = {
  group_id: string;
  group_name: string;
  class_id: string;
  created_date: string;
  updated_date: string;
  students: StudentData[];
};

interface StudentRosterProps {
  students: StudentData[];
  classId: string;
  groups?: GroupData[];
}

const options: Option[] = [
  { value: "none", label: "None", icon: { prefix: "fas", iconName: "xmark" } },
  { value: "boys", label: "Boys", icon: { prefix: "fas", iconName: "child" } },
  {
    value: "girls",
    label: "Girls",
    icon: { prefix: "fas", iconName: "child-dress" },
  },
  { value: "odd", label: "Odd", icon: { prefix: "fas", iconName: "1" } },
  { value: "even", label: "Even", icon: { prefix: "fas", iconName: "2" } },
];

const StudentGrid: React.FC<StudentRosterProps> = ({
  students: initialStudents,
  classId,
  groups,
}) => {
  const [sortingState, setSortingState] = useState<SortingState>("first_name");
  const [students, setStudents] = useState<StudentData[]>(initialStudents);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Create a memoized empty array
  const emptyGroups = React.useMemo(() => [], []);

  // Ensure groups is always the same reference when empty
  groups = groups ?? emptyGroups;

  // Generate groupsOptions from groups prop
  const groupsOptions: Option[] = groups.map((group) => ({
    value: group.group_id,
    label: group.group_name,
    icon: { prefix: "fas", iconName: "users" },
  }));

  // Include "All Groups" option with value "all"
  const allGroupsOptions: Option[] = [
    {
      value: "all",
      label: "All Groups",
      icon: { prefix: "fas", iconName: "layer-group" },
    },
    ...groupsOptions,
  ];

  const getGroupName = (groupId: string) => {
    const group = groupsOptions.find((group) => group.value === groupId);
    return group ? group.label : "";
  };

  // Build a mapping from group_id to Set of student_ids
  const groupStudentIds = React.useMemo(() => {
    const mapping: Record<string, Set<string>> = {};
    if (groups.length > 0) {
      groups.forEach((group) => {
        mapping[group.group_id] = new Set(
          group.students.map((s) => s.student_id),
        );
      });
    }
    return mapping;
  }, [groups]);

  useEffect(() => {
    let filteredStudents = [...initialStudents];

    // Apply filtering based on selectedFilter
    if (selectedFilter !== "none") {
      filteredStudents = filteredStudents.filter((student) => {
        switch (selectedFilter) {
          case "boys":
            return student.student_sex === "male";
          case "girls":
            return student.student_sex === "female";
          case "odd":
            return Number(student.student_number) % 2 !== 0;
          case "even":
            return Number(student.student_number) % 2 === 0;
          default:
            return true;
        }
      });
    }

    // Apply filtering based on selectedGroupFilter
    if (selectedGroupFilter !== "all" && groups.length > 0) {
      const studentIdsInGroup = groupStudentIds[selectedGroupFilter];
      if (studentIdsInGroup) {
        filteredStudents = filteredStudents.filter((student) =>
          studentIdsInGroup.has(student.student_id),
        );
      } else {
        // No students in this group
        filteredStudents = [];
      }
    }

    // Then sort the students
    const sortedStudents = filteredStudents.sort((a, b) => {
      switch (sortingState) {
        case "student_number":
          return compareValues(
            Number(a.student_number),
            Number(b.student_number),
          );
        case "last_name":
          return compareValues(
            a.student_name_en.split(" ")[0],
            b.student_name_en.split(" ")[0],
          );
        case "first_name":
          return compareValues(
            a.student_name_en.split(" ").pop(),
            b.student_name_en.split(" ").pop(),
          );
        case "points":
          return compareValues(a.points, b.points);
        default:
          return 0;
      }
    });
    setStudents(sortedStudents);
  }, [
    sortingState,
    selectedFilter,
    selectedGroupFilter,
    initialStudents,
    groups.length,
    groupStudentIds,
  ]);

  const compareValues = (
    a: string | number | undefined | null,
    b: string | number | undefined | null,
  ): number => {
    if (a === undefined && b === undefined) return 0;
    if (a === undefined) return -1;
    if (b === undefined) return 1;

    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }

    return String(a).localeCompare(String(b));
  };

  const handleSort = (value: string) => {
    setSortingState(value as SortingState);
  };

  const handleMultiSelectToggle = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    // Reset selected students when exiting multi-select mode
    if (isMultiSelectMode) {
      setSelectedStudents([]);
    }
  };

  const handleStudentClick = (studentId: string) => {
    if (isMultiSelectMode) {
      setSelectedStudents((prevSelected) => {
        if (prevSelected.includes(studentId)) {
          // Deselect student
          return prevSelected.filter((id) => id !== studentId);
        } else {
          // Select student
          return [...prevSelected, studentId];
        }
      });
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="text-3xl">Students</div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button>
            <ListChecks size={16} className="mr-2" />
            Attendance
          </Button>
          <Button>
            <FontAwesomeIcon icon={["fas", "plus-minus"]} className="mr-2" />
            Adjust points
          </Button>
          <Button
            variant={isMultiSelectMode ? "secondary" : "default"}
            onClick={handleMultiSelectToggle}
          >
            <CheckSquare size={16} className="mr-2" />
            {isMultiSelectMode ? "Exit Multi-select" : "Multi-select"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button asChild variant="secondary" size="icon">
                  <Link href={`/classes/${classId}/edit`}>
                    <Edit size={16} />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit class</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select onValueChange={handleSort} defaultValue="first_name">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student_number">Sort by Number</SelectItem>
              <SelectItem value="last_name">Sort by Last Name</SelectItem>
              <SelectItem value="first_name">Sort by First Name</SelectItem>
              <SelectItem value="points">Sort by Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-2">
        {groups.length > 0 && (
          <FancyRadioGroup
            options={allGroupsOptions}
            value={selectedGroupFilter}
            onChange={setSelectedGroupFilter}
          />
        )}
        <FancyRadioGroup
          options={options}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>
      {(selectedFilter !== "none" || selectedGroupFilter !== "all") && (
        <div className="text-sm text-gray-500">
          Showing {students.length} students
          {selectedGroupFilter !== "all" &&
            ` in ${getGroupName(selectedGroupFilter)}`}{" "}
          {selectedFilter !== "none" && `by ${selectedFilter}`}
        </div>
      )}
      {isMultiSelectMode && (
        <div className="text-sm text-gray-500">
          {selectedStudents.length} student(s) selected
        </div>
      )}
      <div className="grid grid-cols-3 gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {students.map((student) => {
          const isSelected = selectedStudents.includes(student.student_id);
          return (
            <Card
              key={student.student_id}
              className={`relative col-span-1 ${
                isSelected ? "border-4 border-blue-500" : ""
              } ${isMultiSelectMode ? "cursor-pointer" : ""}`}
              onClick={() => handleStudentClick(student.student_id)}
            >
              <div className="absolute left-1 top-1 text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      #{student.student_number}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Student number</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="absolute right-2 top-2 flex flex-row items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <div className="flex h-7 w-fit min-w-6 items-center justify-center rounded-full bg-primary p-2 text-base text-background">
                        {student.points ?? 0}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Points</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="absolute bottom-1 left-1 flex flex-row items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <div className="flex flex-row items-center justify-center">
                        <BookOpen size={16} className="mr-1" />
                        {student.student_reading_level}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reading level</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-center text-xl">
                  {student.student_name_en.split(" ").pop()}
                  <div className="text-xs">
                    {student.student_sex === "male" ? "Boy" : "Girl"}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent></CardContent>
              <CardFooter></CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentGrid;
