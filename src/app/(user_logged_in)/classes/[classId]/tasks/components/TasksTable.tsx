"use client";

import { useState, useMemo } from "react";
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ArrowUp, ArrowDown, MoreVertical } from "lucide-react";
import {
  FancyRadioGroup,
  type Option,
} from "../../components/SelectRadioGroup";
import { updateStudentAssignment } from "../actions/studentAssignmentsActions";
import { TasksFilter, type DateFilterMode } from "./TasksFilters";
import StudentDialog from "../../components/StudentDialog";
import { type StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { useToast } from "~/components/ui/use-toast";
import Link from "next/link";
import {
  applyBehavior,
  deleteLastBehaviorOccurrence,
} from "../../behaviorActions";

interface Params {
  classId: string;
}

interface AssignmentCellProps {
  assignmentId: string;
  studentId: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  isLoading?: boolean;
}

function AssignmentCell({
  assignmentId,
  studentId,
  checked,
  onCheckedChange,
  isLoading,
}: AssignmentCellProps) {
  return (
    <TableCell className={`text-center ${checked ? "bg-secondary" : ""}`}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={isLoading}
      />
    </TableCell>
  );
}

function StudentActions({
  student,
  classId,
  onOpenDialog,
}: {
  student: StudentData;
  classId: string;
  onOpenDialog: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={`/classes/${classId}/students/${student.student_id}`}>
            Student Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/classes/${classId}/dashboard/${student.student_id}`}>
            Teaching-facing Student Dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SortOrder = "asc" | "desc" | null;

type SortKey =
  | "student_number"
  | "student_name"
  | "group"
  | `assignment_${string}`;

interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

export default function TasksTable({ params }: { params: Params }) {
  const { classId } = params;
  const { toast } = useToast();
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);

  const students = courseData?.students ?? [];
  const assignments = courseData?.assignments ?? [];
  const groups = courseData?.groups ?? [];
  const topics = courseData?.topics ?? [];

  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [filterDueDate, setFilterDueDate] = useState(false);
  const [filterCreatedDate, setFilterCreatedDate] = useState(false);
  const [filterWorkingDate, setFilterWorkingDate] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] =
    useState<boolean>(false);
  const [selectedStudentToView, setSelectedStudentToView] =
    useState<StudentData | null>(null);
  const [loadingBehaviorId, setLoadingBehaviorId] = useState<string | null>(
    null,
  );

  const groupsOptions: Option[] = groups.map((group) => ({
    value: group.group_id,
    label: group.group_name,
    icon: { prefix: "fas", iconName: "users" },
  }));

  const allGroupsOptions: Option[] = [
    {
      value: "all",
      label: "All Groups",
      icon: { prefix: "fas", iconName: "layer-group" },
    },
    ...groupsOptions,
  ];

  // Initialize checkboxStatuses
  const initialCheckboxStatuses = useMemo(() => {
    const statuses: Record<string, boolean> = {};
    for (const assignment of assignments) {
      for (const s of assignment.students ?? []) {
        statuses[`${s.student_id}_${assignment.id}`] = s.complete;
      }
    }
    return statuses;
  }, [assignments]);

  const [checkboxStatuses, setCheckboxStatuses] = useState<
    Record<string, boolean>
  >(initialCheckboxStatuses);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      classId,
      studentId,
      assignmentId,
      completed,
    }: {
      classId: string;
      studentId: string;
      assignmentId: string;
      completed: boolean;
    }) => {
      const result = await updateStudentAssignment({
        classId,
        studentId,
        assignmentId,
        completed,
      });
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: classesOptions.queryKey,
      });
    },
    onError: (error, variables) => {
      setCheckboxStatuses((prev) => ({
        ...prev,
        [`${variables.studentId}_${variables.assignmentId}`]:
          !variables.completed,
      }));
      console.error("Error updating student assignment:", error);
    },
  });

  const applyBehaviorMutation = useMutation({
    mutationFn: async ({
      behaviorId,
      studentId,
      classId,
      inputQuantity = 1,
    }: {
      behaviorId: string;
      studentId: string;
      classId: string;
      inputQuantity?: number;
    }) => {
      const result = await applyBehavior(
        behaviorId,
        [
          {
            student_id: studentId,
            student_name_en: "",
            student_name_alt: null,
            student_reading_level: null,
            student_grade: null,
            student_sex: null,
            student_number: null,
            student_email: null,
            enrollment_date: null,
            redemption_history: [],
          },
        ],
        classId,
        inputQuantity,
      );
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: classesOptions.queryKey,
      });
      toast({
        title: "Success",
        description: "Task marked complete.",
      });
    },
    onError: (error) => {
      console.error("Error applying behavior:", error);
      toast({
        title: "Error",
        description: "Failed to apply behavior. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoadingBehaviorId(null);
    },
  });

  const handleNameClick = (student: StudentData) => {
    setSelectedStudentToView(student);
    setIsStudentDialogOpen(true);
  };

  const closeStudentDialog = () => {
    setIsStudentDialogOpen(false);
    setSelectedStudentToView(null);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        const newOrder = prev.order === "asc" ? "desc" : "asc";
        return { key, order: newOrder };
      }
      return { key, order: "asc" };
    });
  };

  const handleCheckboxChange = async (
    studentId: string,
    assignmentId: string,
    checked: boolean,
  ) => {
    const behaviorId = "behavior_20c4128a-fa4c-4632-bb29-848c5143bbe4"; // Store ID in a constant

    setCheckboxStatuses((prev) => ({
      ...prev,
      [`${studentId}_${assignmentId}`]: checked,
    }));

    try {
      // First update the assignment status
      await mutation.mutateAsync({
        classId,
        studentId,
        assignmentId,
        completed: checked,
      });

      // If checked, apply the behavior
      if (checked) {
        setLoadingBehaviorId(behaviorId);
        await applyBehaviorMutation.mutateAsync({
          behaviorId,
          studentId,
          classId,
        });
      } else {
        // If unchecked, remove the last behavior occurrence
        setLoadingBehaviorId(behaviorId);
        const result = await deleteLastBehaviorOccurrence(
          behaviorId,
          studentId,
          classId,
        );

        if (!result.success) {
          throw new Error(result.message);
        }

        toast({
          title: "Success",
          description: "Task marked incomplete.",
        });

        await queryClient.invalidateQueries({
          queryKey: classesOptions.queryKey,
        });
      }
    } catch (error) {
      // Revert checkbox state if either operation fails
      setCheckboxStatuses((prev) => ({
        ...prev,
        [`${studentId}_${assignmentId}`]: !checked,
      }));

      console.error("Error updating assignment or behavior:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update assignment or behavior. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingBehaviorId(null);
    }
  };

  const sortedStudents = useMemo(() => {
    const sortableStudents = [...students];

    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        let aValue: string | number | boolean = "";
        let bValue: string | number | boolean = "";

        if (sortConfig.key.startsWith("assignment_")) {
          const assignmentId = sortConfig.key.split("_")[1];
          aValue = checkboxStatuses[`${a.student_id}_${assignmentId}`] ?? false;
          bValue = checkboxStatuses[`${b.student_id}_${assignmentId}`] ?? false;
        } else {
          switch (sortConfig.key) {
            case "student_number":
              aValue = a.student_number ?? 0;
              bValue = b.student_number ?? 0;
              break;
            case "student_name":
              aValue = a.student_name_en.split(" ")[1] ?? "";
              bValue = b.student_name_en.split(" ")[1] ?? "";
              break;
            case "group":
              const aGroup = groups.find((g) =>
                g.students.some((s) => s.student_id === a.student_id),
              )?.group_name;
              const bGroup = groups.find((g) =>
                g.students.some((s) => s.student_id === b.student_id),
              )?.group_name;
              aValue = aGroup ?? "No Group";
              bValue = bGroup ?? "No Group";
              break;
          }
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          if (aValue === bValue) return 0;
          return sortConfig.order === "asc"
            ? aValue
              ? -1
              : 1
            : aValue
              ? 1
              : -1;
        }

        if (aValue < bValue) return sortConfig.order === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.order === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sortableStudents;
  }, [students, sortConfig, groups, checkboxStatuses]);

  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => a.name.localeCompare(b.name)),
    [assignments],
  );

  const filteredStudents = useMemo(() => {
    if (selectedGroupId === "all") return sortedStudents;
    return sortedStudents.filter((student) =>
      groups
        .find((g) => g.group_id === selectedGroupId)
        ?.students.some((s) => s.student_id === student.student_id),
    );
  }, [selectedGroupId, sortedStudents, groups]);

  const filteredAssignments = useMemo(() => {
    return sortedAssignments.filter((assignment) => {
      const passesTopicFilter =
        selectedTopicIds.length === 0 ||
        selectedTopicIds.includes(assignment.topic ?? "");

      const passesDueDateFilter = !filterDueDate || !!assignment.due_date;
      const passesCreatedDateFilter =
        !filterCreatedDate || !!assignment.created_date;
      const passesWorkingDateFilter =
        !filterWorkingDate || !!assignment.working_date;

      return (
        passesTopicFilter &&
        passesDueDateFilter &&
        passesCreatedDateFilter &&
        passesWorkingDateFilter
      );
    });
  }, [
    sortedAssignments,
    selectedTopicIds,
    filterDueDate,
    filterCreatedDate,
    filterWorkingDate,
  ]);

  const handleFilterChange = (filters: {
    selectedTopicIds: string[];
    dueDateMode: DateFilterMode;
    dueDateStart: Date | undefined;
    dueDateEnd: Date | undefined;
    createdDateMode: DateFilterMode;
    createdDateStart: Date | undefined;
    createdDateEnd: Date | undefined;
    workingDateMode: DateFilterMode;
    workingDateStart: Date | undefined;
    workingDateEnd: Date | undefined;
  }) => {
    setSelectedTopicIds(filters.selectedTopicIds);
    setFilterDueDate(filters.dueDateMode !== "none");
    setFilterCreatedDate(filters.createdDateMode !== "none");
    setFilterWorkingDate(filters.workingDateMode !== "none");
  };

  return (
    <div className="w-full space-y-4 overflow-x-auto">
      <div className="mt-2 flex items-center gap-2">
        <FancyRadioGroup
          options={allGroupsOptions}
          value={selectedGroupId}
          onChange={(value) => setSelectedGroupId(value)}
        />
      </div>

      <TasksFilter topics={topics} onFilterChange={handleFilterChange} />

      {isStudentDialogOpen && selectedStudentToView && (
        <StudentDialog
          studentId={selectedStudentToView.student_id}
          classId={classId}
          onClose={closeStudentDialog}
        />
      )}
      <Table>
        <TableCaption>Tasks for {courseData?.class_name}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              className="sticky left-0 z-10 w-16 cursor-pointer bg-background text-foreground"
              onClick={() => handleSort("student_number")}
            >
              <div className="flex items-center justify-center">
                #
                {sortConfig?.key === "student_number" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>

            <TableHead
              className="sticky left-16 z-10 w-32 cursor-pointer bg-background text-foreground"
              onClick={() => handleSort("group")}
            >
              <div className="flex items-center justify-center">
                Group
                {sortConfig?.key === "group" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>

            <TableHead
              className="sticky left-32 z-10 w-48 cursor-pointer border-r border-dotted border-foreground bg-background text-foreground lg:left-48"
              onClick={() => handleSort("student_name")}
            >
              <div className="flex items-center justify-center">
                Student
                {sortConfig?.key === "student_name" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>

            {filteredAssignments.map((assignment) => {
              const sortKey = `assignment_${assignment.id}` as SortKey;
              return (
                <TableHead
                  key={assignment.id}
                  className="cursor-pointer text-foreground"
                  onClick={() => handleSort(sortKey)}
                >
                  <div className="flex items-center justify-center">
                    {assignment.name}
                    {sortConfig?.key === sortKey &&
                      (sortConfig.order === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => {
            const studentGroup = groups.find((group) =>
              group.students.some((s) => s.student_id === student.student_id),
            );
            return (
              <TableRow key={student.student_id}>
                <TableCell className="sticky left-0 z-10 w-16 bg-background text-center">
                  {student.student_number}
                </TableCell>

                <TableCell className="sticky left-16 z-10 w-32 bg-background text-center">
                  {studentGroup?.group_name ?? "No Group"}
                </TableCell>

                <TableCell className="sticky left-32 z-10 w-48 border-r border-dotted border-foreground bg-background lg:left-48">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleNameClick(student)}
                      className="text-primary hover:underline"
                    >
                      {student.student_name_en.split(" ")[1]}
                    </button>
                    <StudentActions
                      student={student}
                      classId={classId}
                      onOpenDialog={() => handleNameClick(student)}
                    />
                  </div>
                </TableCell>

                {filteredAssignments.map((assignment) => (
                  <AssignmentCell
                    key={assignment.id}
                    assignmentId={assignment.id}
                    studentId={student.student_id}
                    checked={
                      checkboxStatuses[
                        `${student.student_id}_${assignment.id}`
                      ] ?? false
                    }
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        student.student_id,
                        assignment.id,
                        checked,
                      )
                    }
                    isLoading={loadingBehaviorId !== null}
                  />
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
