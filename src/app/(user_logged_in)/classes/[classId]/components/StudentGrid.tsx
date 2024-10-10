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
import { BookA, CheckSquare, Edit, ListChecks } from "lucide-react";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { FancyRadioGroup, type Option } from "./SelectRadioGroup";

type SortingState = "student_number" | "last_name" | "first_name" | "points";

interface StudentRosterProps {
  students: StudentData[];
  classId: string;
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
}) => {
  const [sortingState, setSortingState] = useState<SortingState>("first_name");
  const [students, setStudents] = useState<StudentData[]>(initialStudents);

  useEffect(() => {
    const sortedStudents = [...initialStudents].sort((a, b) => {
      switch (sortingState) {
        case "student_number":
          return compareValues(a.student_number, b.student_number);
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
            <CheckSquare size={16} className="mr-2" />
            Multi-select
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
          <FancyRadioGroup options={options} />
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
      <div className="grid grid-cols-3 gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {students.map((student) => (
          <Card key={student.student_id} className="relative col-span-1">
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
                      <BookA size={16} className="mr-1" />
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
                  {student.student_sex === "male" ? "boy" : "girl"}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentGrid;
