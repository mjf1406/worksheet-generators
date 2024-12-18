// components/StudentGrid.tsx

"use client";

import React, {
  useState,
  useEffect,
  useTransition,
  ReactEventHandler,
} from "react";
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
  EllipsisVertical,
  Trash2,
  Loader,
  UserCheck,
  Monitor,
} from "lucide-react";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { FancyRadioGroup, type Option } from "./SelectRadioGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "~/lib/utils";
import ApplyBehaviorDialog from "./ApplyBehaviorsDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import EditStudentDialog from "./EditStudentDialog"; // Import the new dialog
import StudentDialog from "./StudentDialog"; // Import the student details dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"; // Import AlertDialog components
import { deleteStudent } from "../actions";
import { AddStudentsDialog } from "../../components/AddStudents";
import type { Student } from "~/server/db/types";
import { saveAttendance } from "../attendanceActions";
import { useToast } from "~/components/ui/use-toast";

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
  const [isAttendanceSaving, setIsAttendanceSaving] = useState<boolean>(false); // Loading state for attendance
  const [isBehaviorDialogOpen, setIsBehaviorDialogOpen] =
    useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedStudentToEdit, setSelectedStudentToEdit] =
    useState<StudentData | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] =
    useState<boolean>(false);
  const [selectedStudentToView, setSelectedStudentToView] =
    useState<StudentData | null>(null);
  const [isApplyBehaviorDialogOpen, setIsApplyBehaviorDialogOpen] =
    useState<boolean>(false);
  const { toast } = useToast();

  // State for deletion confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentData | null>(
    null,
  );

  // State for handling transitions
  const [isPending, startTransition] = useTransition();

  // New state for Compact Mode
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);

  // Handler to update the students state when new students are added
  const handleStudentsAdded = (newStudents: Student[]) => {
    // Map the new students to match the StudentData type if necessary
    const mappedNewStudents: StudentData[] = newStudents.map((student) => ({
      ...student,
    })) as unknown as StudentData[];
    setStudents((prevStudents) => [...prevStudents, ...mappedNewStudents]);
  };

  // Function to open the ApplyBehaviorDialog
  const openApplyBehaviorDialog = () => {
    if (selectedStudents.length > 0) {
      setIsApplyBehaviorDialogOpen(true);
    }
  };

  // Function to close the ApplyBehaviorDialog
  const closeApplyBehaviorDialog = () => {
    setIsApplyBehaviorDialogOpen(false);
    setIsMultiSelectMode(false);
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
          return compareValues(b.points, a.points);
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

  const getCurrentDate = (): string => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);

    const yearPart = parts.find((part) => part.type === "year");
    const monthPart = parts.find((part) => part.type === "month");
    const dayPart = parts.find((part) => part.type === "day");

    const year = yearPart ? yearPart.value : "";
    const month = monthPart ? monthPart.value : "";
    const day = dayPart ? dayPart.value : "";

    return `${year}-${month}-${day}`; // YYYY-MM-DD
  };

  const handleAttendanceToggle = () => {
    if (isAttendanceMode) {
      // Exiting attendance mode without saving
      setIsAttendanceMode(false);
      setAttendanceStatus({});
    } else {
      // Entering attendance mode
      const initialAttendance: Record<string, "present" | "absent"> = {};
      const today = getCurrentDate();
      students.forEach((student) => {
        const isAbsentToday = student.absent_dates?.includes(today);
        initialAttendance[student.student_id] = isAbsentToday
          ? "absent"
          : "present";
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
      // Open the StudentDialog for viewing details
      setSelectedStudentToView(student);
      setIsStudentDialogOpen(true);
    }
  };

  const handleAdjustPoints = () => {
    if (selectedStudents.length > 0) {
      setIsBehaviorDialogOpen(true);
    }
  };

  const handleSelectAllPresent = () => {
    const today = getCurrentDate(); // Get today's date
    const presentStudents = students.filter(
      (student) => !student.absent_dates?.includes(today),
    );
    setSelectedStudents(presentStudents);
    setIsMultiSelectMode(true);
  };

  const handleApplyClick = () => {
    if (!isMultiSelectMode) {
      // Select all present students and enable multi-select mode
      const today = getCurrentDate();
      const presentStudents = students.filter(
        (student) => !student.absent_dates?.includes(today),
      );
      setSelectedStudents(presentStudents);
      setIsMultiSelectMode(true);
      setIsApplyBehaviorDialogOpen(true);
    }

    // Open the ApplyBehaviorDialog if there are selected students
    if (selectedStudents.length > 0) {
      setIsApplyBehaviorDialogOpen(true);
    }
  };

  const handleSaveAttendance = async () => {
    setIsAttendanceSaving(true); // Start loading state
    // Get the current date in user's timezone
    const date = getCurrentDate();

    // Prepare attendance data
    const absentStudentIds = Object.keys(attendanceStatus).filter(
      (studentId) => attendanceStatus[studentId] === "absent",
    );

    // Call the server action to save attendance
    try {
      const result = await saveAttendance(classId, date, absentStudentIds);
      if (result.success) {
        // Show a success message
        toast({
          title: "Success",
          description: "Attendance saved successfully.",
        });
        console.log("Attendance saved successfully.");

        // Update students' absent_dates in local state
        setStudents((prevStudents) =>
          prevStudents.map((student) => {
            const isAbsent = absentStudentIds.includes(student.student_id);
            const updatedAbsentDates = student.absent_dates ?? [];
            const today = getCurrentDate();

            if (isAbsent) {
              // Add today's date if not already present
              if (!updatedAbsentDates.includes(today)) {
                updatedAbsentDates.push(today);
              }
            } else {
              // Remove today's date if present
              const index = updatedAbsentDates.indexOf(today);
              if (index > -1) {
                updatedAbsentDates.splice(index, 1);
              }
            }

            return {
              ...student,
              absent_dates: updatedAbsentDates,
            };
          }),
        );
      } else {
        // Handle error
        console.error("Error saving attendance:", result.message);
        toast({
          title: "Error",
          description: "Failed to save attendance.",
        });
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsAttendanceSaving(false); // End loading state
      // After saving, exit attendance mode
      setIsAttendanceMode(false);
      setAttendanceStatus({});
    }
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

  // Function to handle student updates from the edit dialog
  const handleStudentUpdate = (updatedStudent: StudentData) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === updatedStudent.student_id
          ? updatedStudent
          : student,
      ),
    );
  };

  // Function to close StudentDialog
  const closeStudentDialog = () => {
    setIsStudentDialogOpen(false);
    setSelectedStudentToView(null);
  };

  // Function to close EditStudentDialog
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedStudentToEdit(null);
  };

  // Function to open the delete confirmation dialog
  const openDeleteDialog = (student: StudentData) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  // Function to close the delete confirmation dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // Function to handle the deletion of a student
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      // Start the transition to indicate pending state
      startTransition(async () => {
        const result = await deleteStudent(studentToDelete.student_id, classId);

        if (result.success) {
          // Remove the deleted student from the local state
          setStudents((prevStudents) =>
            prevStudents.filter(
              (student) => student.student_id !== studentToDelete.student_id,
            ),
          );
          closeDeleteDialog();
          // Optionally, show a success toast or notification
          // e.g., toast.success(result.message);
        } else {
          // Handle error (e.g., show a toast notification)
          console.error(result.message);
          // e.g., toast.error(result.message);
        }
      });
    } catch (error) {
      console.error("Failed to delete student:", error);
      // e.g., toast.error("An unexpected error occurred.");
    }
  };

  const today = getCurrentDate(); // Get today's date once

  return (
    <div className="flex flex-col justify-center gap-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {/* Existing Buttons */}
          <Button
            onClick={handleAttendanceToggle}
            variant={isAttendanceMode ? "secondary" : "default"}
          >
            <ListChecks size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">
              {isAttendanceMode ? "Cancel Attendance" : "Attendance"}
            </span>
          </Button>
          <Button onClick={handleApplyClick}>
            <FontAwesomeIcon icon={["fas", "plus-minus"]} className="sm:mr-2" />
            <span className="hidden sm:inline">Apply</span>
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
          <AddStudentsDialog
            classId={classId}
            existingStudents={students as unknown as Student[]}
            onStudentsAdded={handleStudentsAdded}
          />
          {/* New Compact Mode Toggle Button */}
          <Button
            variant={isCompactMode ? "secondary" : "default"}
            size={"icon"}
            onClick={() => setIsCompactMode(!isCompactMode)}
          >
            {isCompactMode ? (
              <>
                <Monitor size={16} />
              </>
            ) : (
              <>
                <Monitor size={16} />
              </>
            )}
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div>
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
      </div>

      {/* Filter Controls */}
      <div>
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
        <div>
          {(selectedFilter !== "none" || selectedGroupFilter !== "all") && (
            <div className="text-sm text-gray-500">
              Selected {selectedStudents.length} student
              {selectedStudents.length !== 1 && "s"}
              {selectedGroupFilter !== "all" &&
                ` in ${getGroupName(selectedGroupFilter)}`}{" "}
              {selectedFilter !== "none" && `by ${selectedFilter}`}
            </div>
          )}
          {isMultiSelectMode && (
            <div className="text-sm text-gray-500">
              {selectedStudents.length} student
              {selectedStudents.length !== 1 && "s"} selected
            </div>
          )}
        </div>
      </div>

      {/* Student Grid */}
      <div
        className={`grid grid-cols-4 gap-2 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6 2xl:grid-cols-8`}
      >
        {students.map((student) => {
          const isSelected = selectedStudents.some(
            (s) => s.student_id === student.student_id,
          );
          const attendance = attendanceStatus[student.student_id];
          const isAbsentToday = student.absent_dates?.includes(today);

          return (
            <Card
              key={student.student_id}
              className={cn(
                "relative col-span-1 h-fit transform cursor-pointer transition-transform hover:scale-105 md:h-full",
                isSelected && "bg-accent/25",
                !isSelected && selectedStudents.length >= 1 && "opacity-50",
                (isAttendanceMode || isMultiSelectMode) && "cursor-pointer",
                isAttendanceMode && attendance === "absent" && "opacity-40",
                !isAttendanceMode && isAbsentToday && "opacity-30",
                // isCompactMode ? "flex items-center justify-center" : "",
              )}
              onClick={() => {
                handleStudentClick(student.student_id);
              }}
            >
              {/* Compact Mode Rendering */}
              {isCompactMode ? (
                <>
                  <div className="absolute left-2 top-1 text-lg text-gray-500">
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
                  {/* Points Front and Center */}
                  <CardHeader className="p-1 pt-5 md:p-6 md:pt-8">
                    <CardTitle className="flex flex-col text-center text-4xl font-bold text-primary">
                      {student.points ?? 0}
                    </CardTitle>
                  </CardHeader>
                </>
              ) : (
                <>
                  {/* Attendance Indicator */}
                  {isAttendanceMode && (
                    <div className="absolute bottom-0 right-0 m-1 flex items-center justify-center rounded-xl">
                      {attendance === "present" ? (
                        <Check
                          size={54}
                          className="text-green-500 opacity-50"
                        />
                      ) : (
                        <X size={54} className="text-red-500 opacity-50" />
                      )}
                    </div>
                  )}

                  {/* Student Number Tooltip */}
                  <div className="text-2xs absolute left-1 top-1 md:text-sm">
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

                  {/* Dropdown Menu */}
                  <div className="absolute bottom-1 right-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          className="h-fit w-fit p-1 md:p-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when opening dropdown
                          }}
                        >
                          <EllipsisVertical className="h-2 w-2 md:h-4 md:w-4" />{" "}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when selecting edit
                            setSelectedStudentToEdit(student);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit size={16} className="mr-2" /> Edit student
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when selecting delete
                            openDeleteDialog(student);
                          }}
                        >
                          <Trash2 size={16} className="mr-2" /> Delete student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Points Tooltip */}
                  <div className="absolute right-1 top-1 flex flex-row items-center justify-center md:right-2 md:top-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <div className="text-2xs flex h-4 w-fit min-w-6 items-center justify-center rounded-full bg-primary p-0.5 text-background md:h-7 md:p-2 md:text-base">
                            {student.points ?? 0}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Points</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Reading Level Tooltip */}
                  <div className="absolute bottom-1 left-1 flex flex-row items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <div className="text-2xs flex flex-row items-center justify-center md:text-base">
                            <BookOpen className="mr-1 h-2 w-2 md:h-4 md:w-4" />
                            {student.student_reading_level}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reading level</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Student Name */}
                  <CardHeader className="p-1 pt-5 md:p-6 md:pt-8">
                    <CardTitle className="flex flex-col text-center text-sm md:text-xl">
                      <div>{student.student_name_en.split(" ").pop()}</div>
                      <div className="text-3xs md:text-xs">
                        {student.student_sex === "male" ? "Boy" : "Girl"}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Attendance Save Button */}
      <div className="flex w-full justify-end gap-2">
        {isAttendanceMode && (
          <Button onClick={handleSaveAttendance} disabled={isAttendanceSaving}>
            {isAttendanceSaving ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save attendance
              </>
            )}
          </Button>
        )}
      </div>

      {/* Dialogs */}
      {/* StudentDialog */}
      {isStudentDialogOpen && selectedStudentToView && (
        <StudentDialog
          studentId={selectedStudentToView.student_id}
          classId={classId}
          onClose={closeStudentDialog}
        />
      )}
      {/* EditStudentDialog */}
      {isEditDialogOpen && selectedStudentToEdit && (
        <EditStudentDialog
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          student={selectedStudentToEdit}
          onUpdate={handleStudentUpdate}
        />
      )}
      {/* ApplyBehaviorDialog */}
      {isApplyBehaviorDialogOpen && (
        <ApplyBehaviorDialog
          selectedStudents={selectedStudents}
          classId={classId}
          onClose={closeApplyBehaviorDialog}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{studentToDelete?.student_name_en}</strong>? This action
              CANNOT be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 size={16} className="mr-2" />{" "}
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentGrid;
