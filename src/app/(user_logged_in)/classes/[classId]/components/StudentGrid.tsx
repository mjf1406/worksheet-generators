import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
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
import {
  BookOpen,
  CheckSquare,
  Edit,
  ListChecks,
  Check,
  X,
  Save,
} from "lucide-react";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { FancyRadioGroup, type Option } from "./SelectRadioGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "~/lib/utils";
import StudentDialog from "./StudentDialog";
import ApplyBehaviorDialog from "./ApplyBehaviorsDialog";

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
  const [selectedStudents, setSelectedStudents] = useState<StudentData[]>([]);
  const [isAttendanceMode, setIsAttendanceMode] = useState<boolean>(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, "present" | "absent">
  >({});
  const [isBehaviorDialogOpen, setIsBehaviorDialogOpen] =
    useState<boolean>(false);

  // State for individual student dialog
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // State for ApplyBehaviorDialog
  const [isApplyBehaviorDialogOpen, setIsApplyBehaviorDialogOpen] =
    useState<boolean>(false);

  // Function to open the ApplyBehaviorDialog
  const openApplyBehaviorDialog = () => {
    if (selectedStudents.length > 0) {
      setIsApplyBehaviorDialogOpen(true);
    }
  };

  // Function to close the ApplyBehaviorDialog
  const closeApplyBehaviorDialog = () => {
    setIsApplyBehaviorDialogOpen(false);
  };

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
    // Then sort the students
    const sortedStudents = [...initialStudents].sort((a, b) => {
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
  }, [sortingState, initialStudents]);

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

  const handleAttendanceToggle = () => {
    if (isAttendanceMode) {
      // Exiting attendance mode without saving
      setIsAttendanceMode(false);
      setAttendanceStatus({});
    } else {
      // Entering attendance mode
      const initialAttendance: Record<string, "present"> = {};
      students.forEach((student) => {
        initialAttendance[student.student_id] = "present";
      });
      setAttendanceStatus(initialAttendance);
      setIsAttendanceMode(true);
    }
  };

  const handleStudentClick = (studentId: string) => {
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;

    if (isAttendanceMode) {
      // Toggle attendance status
      setAttendanceStatus((prevStatus) => ({
        ...prevStatus,
        [studentId]: prevStatus[studentId] === "present" ? "absent" : "present",
      }));
    } else if (isMultiSelectMode) {
      setSelectedStudents((prevSelected) => {
        if (prevSelected.some((s) => s.student_id === studentId)) {
          // Deselect student
          return prevSelected.filter((s) => s.student_id !== studentId);
        } else {
          // Select student
          return [...prevSelected, student];
        }
      });
    } else {
      // Open the individual student dialog
      setSelectedStudentId(studentId);
      setIsDialogOpen(true);
    }
  };

  const handleAdjustPoints = () => {
    if (selectedStudents.length > 0) {
      setIsBehaviorDialogOpen(true);
    }
  };

  const handleSaveAttendance = () => {
    // Implement the logic to save the attendance data
    // For demonstration, we'll just log the data
    console.log("Attendance data:", attendanceStatus);
    // After saving, exit attendance mode
    setIsAttendanceMode(false);
    setAttendanceStatus({});
  };

  // Update selectedStudents when filters change
  useEffect(() => {
    // If filters are default, clear selection
    if (selectedFilter === "none" && selectedGroupFilter === "all") {
      setSelectedStudents([]);
    } else {
      // Build the list of student objects matching the filters
      let filteredStudents = [...students];

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

      if (selectedGroupFilter !== "all" && groups.length > 0) {
        const studentIdsInGroup = groupStudentIds[selectedGroupFilter];
        if (studentIdsInGroup) {
          filteredStudents = filteredStudents.filter((student) =>
            studentIdsInGroup.has(student.student_id),
          );
        } else {
          filteredStudents = [];
        }
      }

      setSelectedStudents(filteredStudents);
    }
  }, [
    selectedFilter,
    selectedGroupFilter,
    students,
    groups.length,
    groupStudentIds,
  ]);

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="text-3xl">Students</div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={handleAttendanceToggle}
            variant={isAttendanceMode ? "secondary" : "default"}
          >
            <ListChecks size={16} className="sm:mr-2" />

            <span className="hidden sm:inline">
              {isAttendanceMode ? "Cancel Attendance" : "Attendance"}
            </span>
          </Button>
          <Button
            className={cn(
              selectedStudents.length < 1 && "cursor-not-allowed opacity-50",
            )}
            disabled={selectedStudents.length < 1}
            onClick={openApplyBehaviorDialog}
          >
            <FontAwesomeIcon icon={["fas", "plus-minus"]} className="sm:mr-2" />
            <span className="hidden sm:inline">Apply Behavior</span>
          </Button>

          <Button
            variant={isMultiSelectMode ? "secondary" : "default"}
            onClick={handleMultiSelectToggle}
          >
            <CheckSquare size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">
              {isMultiSelectMode ? "Exit Multi-select" : "Multi-select"}
            </span>
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
      <div className="flex flex-col items-center justify-start gap-2 md:flex-row">
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
        {(selectedFilter !== "none" || selectedGroupFilter !== "all") && (
          <div className="text-sm text-gray-500">
            Selected {selectedStudents.length} student
            {selectedStudents.length !== 1 && "s"}
            {selectedGroupFilter !== "all" &&
              ` in ${getGroupName(selectedGroupFilter)}`}{" "}
            {selectedFilter !== "none" && `by ${selectedFilter}`}
          </div>
        )}
      </div>
      {isMultiSelectMode && (
        <div className="text-sm text-gray-500">
          {selectedStudents.length} student
          {selectedStudents.length !== 1 && "s"} selected
        </div>
      )}
      <div className="grid grid-cols-3 gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {students.map((student) => {
          const isSelected = selectedStudents.some(
            (s) => s.student_id === student.student_id,
          );
          const attendance = attendanceStatus[student.student_id]; // 'present' or 'absent'

          return (
            <Card
              key={student.student_id}
              className={`relative col-span-1 h-fit md:h-full ${
                isSelected && "bg-accent/25"
              } ${
                !isSelected && selectedStudents.length >= 1 && "opacity-50"
              } ${
                isAttendanceMode || isMultiSelectMode
                  ? "cursor-pointer"
                  : "cursor-pointer"
              } ${isAttendanceMode && attendance === "absent" && "opacity-40"}`}
              onClick={() => handleStudentClick(student.student_id)}
            >
              {isAttendanceMode && (
                <div className="absolute bottom-0 right-0 m-1 flex items-center justify-center rounded-xl">
                  {attendance === "present" ? (
                    <Check size={54} className="text-green-500 opacity-50" />
                  ) : (
                    <X size={54} className="text-red-500 opacity-50" />
                  )}
                </div>
              )}
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
                <CardTitle className="text-center text-base md:text-xl">
                  {student.student_name_en.split(" ").pop()}
                  <div className="text-xs">
                    {student.student_sex === "male" ? "Boy" : "Girl"}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <div className="flex w-full justify-end gap-2">
        {isAttendanceMode && (
          <Button onClick={handleSaveAttendance}>
            <Save size={16} className="mr-2" />
            Save attendance
          </Button>
        )}
      </div>
      {isDialogOpen && selectedStudentId && (
        <StudentDialog
          studentId={selectedStudentId}
          classId={classId}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
      {isApplyBehaviorDialogOpen && (
        <ApplyBehaviorDialog
          selectedStudents={selectedStudents}
          classId={classId}
          onClose={closeApplyBehaviorDialog}
        />
      )}
    </div>
  );
};

export default StudentGrid;
