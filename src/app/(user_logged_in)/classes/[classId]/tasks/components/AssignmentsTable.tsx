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
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  FancyRadioGroup,
  type Option,
} from "../../components/SelectRadioGroup";
import Link from "next/link";

import { updateStudentAssignment } from "../actions/studentAssignmentsActions";
import { AssignmentsFilter, DateFilterMode } from "./AssignmentsFilters";

interface Params {
  classId: string;
}

interface AssignmentCellProps {
  assignmentId: string;
  studentId: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function AssignmentCell({
  assignmentId,
  studentId,
  checked,
  onCheckedChange,
}: AssignmentCellProps) {
  return (
    <TableCell className={`text-center ${checked ? "bg-secondary" : ""}`}>
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
    </TableCell>
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

export default function AssignmentsTable({ params }: { params: Params }) {
  const { classId } = params;
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);

  const students = courseData?.students ?? [];
  const assignments = courseData?.assignments ?? [];
  const groups = courseData?.groups ?? [];
  const topics = courseData?.topics ?? [];

  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

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

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Filters state
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [filterDueDate, setFilterDueDate] = useState(false);
  const [filterCreatedDate, setFilterCreatedDate] = useState(false);
  const [filterWorkingDate, setFilterWorkingDate] = useState(false);

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

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        const newOrder = prev.order === "asc" ? "desc" : "asc";
        return { key, order: newOrder };
      }
      return { key, order: "asc" };
    });
  };

  const handleCheckboxChange = (
    studentId: string,
    assignmentId: string,
    checked: boolean,
  ) => {
    // Optimistic update
    setCheckboxStatuses((prev) => ({
      ...prev,
      [`${studentId}_${assignmentId}`]: checked,
    }));

    // Run mutation
    mutation.mutate({
      classId,
      studentId,
      assignmentId,
      completed: checked,
    });
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
            default:
              break;
          }
        }

        // Handle boolean sorting
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

        // Handle string/number sorting
        if (aValue < bValue) {
          return sortConfig.order === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.order === "asc" ? 1 : -1;
        }
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

  // Filter assignments based on selectedTopicIds and other date filters
  const filteredAssignments = useMemo(() => {
    return sortedAssignments.filter((assignment) => {
      const passesTopicFilter =
        selectedTopicIds.length === 0 ||
        selectedTopicIds.includes(assignment.topic ?? "");

      let passesDueDateFilter = true;
      let passesCreatedDateFilter = true;
      let passesWorkingDateFilter = true;

      if (filterDueDate) {
        // For example, only show assignments that have a due_date defined
        passesDueDateFilter = !!assignment.due_date;
      }

      if (filterCreatedDate) {
        // Only show assignments with a created_date defined
        passesCreatedDateFilter = !!assignment.created_date;
      }

      if (filterWorkingDate) {
        // Only show assignments with a working_date defined
        passesWorkingDateFilter = !!assignment.working_date;
      }

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
    // Update the state with the new filter values
    setSelectedTopicIds(filters.selectedTopicIds);
    setFilterDueDate(filters.dueDateMode !== "none");
    setFilterCreatedDate(filters.createdDateMode !== "none");
    setFilterWorkingDate(filters.workingDateMode !== "none");
  };

  return (
    <div className="w-full space-y-4 overflow-x-auto">
      {/* Existing group filters */}
      <div className="mt-2 flex items-center gap-2">
        <FancyRadioGroup
          options={allGroupsOptions}
          value={selectedGroupId}
          onChange={(value) => setSelectedGroupId(value)}
        />
      </div>

      {/* New filters for assignments */}
      <AssignmentsFilter topics={topics} onFilterChange={handleFilterChange} />

      <Table>
        <TableCaption>Tasks for {courseData?.class_name}</TableCaption>
        <TableHeader>
          <TableRow>
            {/* Column 1: Student Number */}
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
                {sortConfig?.key !== "student_number" && (
                  <ArrowDown className="ml-1 h-4 w-4 text-transparent" />
                )}
              </div>
            </TableHead>

            {/* Column 2: Group */}
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
                {sortConfig?.key !== "group" && (
                  <ArrowDown className="ml-1 h-4 w-4 text-transparent" />
                )}
              </div>
            </TableHead>

            {/* Column 3: Student Name */}
            <TableHead
              className="sticky left-48 z-10 w-48 cursor-pointer bg-background text-foreground"
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
                {sortConfig?.key !== "student_name" && (
                  <ArrowDown className="ml-1 h-4 w-4 text-transparent" />
                )}
              </div>
            </TableHead>

            {/* Assignment Columns */}
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
                {/* Column 1: Student Number */}
                <TableCell className="sticky left-0 z-10 w-16 bg-background text-center">
                  {student.student_number}
                </TableCell>

                {/* Column 2: Group */}
                <TableCell className="sticky left-16 z-10 w-32 bg-background text-center">
                  {studentGroup?.group_name ?? "No Group"}
                </TableCell>

                {/* Column 3: Student Name */}
                <TableCell className="sticky left-48 z-10 w-48 bg-background text-center">
                  <Link
                    href={`/classes/${classId}/students/${student.student_id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {student.student_name_en.split(" ")[1]}
                  </Link>
                </TableCell>

                {/* Assignment Cells */}
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
