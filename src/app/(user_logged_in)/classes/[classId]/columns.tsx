import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { GRADES } from "~/lib/constants";
import type { CustomTableMeta } from "~/components/ui/data-table";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

export const columns: ColumnDef<StudentData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "student_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "student_name_first_en",
    header: "Name",
    cell: ({ row, table }): JSX.Element => {
      const meta = table.options.meta as CustomTableMeta;
      const isEditing = meta.isEditing;

      return isEditing ? (
        <Input
          value={row.getValue("student_name_first_en")}
          onChange={(e) =>
            meta.updateData(row.index, "student_name_first_en", e.target.value)
          }
        />
      ) : (
        <div>{row.getValue("student_name_first_en")}</div>
      );
    },
  },
  {
    accessorKey: "student_name_alt",
    header: "Alt. Name",
    cell: ({ row, table }): JSX.Element => {
      const meta = table.options.meta as CustomTableMeta;
      const isEditing = meta.isEditing;

      return isEditing ? (
        <Input
          value={row.getValue("student_name_alt")}
          onChange={(e) =>
            meta.updateData(row.index, "student_name_alt", e.target.value)
          }
        />
      ) : (
        row.getValue("student_name_alt")
      );
    },
  },
  {
    accessorKey: "student_sex",
    header: "Sex",
    cell: ({ row, table }): JSX.Element => {
      const meta = table.options.meta as CustomTableMeta;
      const isEditing = meta.isEditing;
      const initialValue: string = row.getValue("student_sex");

      return isEditing ? (
        <Select
          value={initialValue}
          onValueChange={(value) =>
            meta.updateData(row.index, "student_sex", value)
          }
        >
          {/* ... SelectContent ... */}
        </Select>
      ) : (
        <div>{row.getValue("student_sex")}</div>
      );
    },
  },
  {
    accessorKey: "student_grade",
    header: "Grade",
    cell: ({ row, table }): JSX.Element => {
      const meta = table.options.meta as CustomTableMeta;
      const isEditing = meta.isEditing;

      return isEditing ? (
        <Select
          value={row.getValue("student_grade")}
          onValueChange={(value) =>
            meta.updateData(row.index, "student_grade", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        row.getValue("student_grade")
      );
    },
  },
  {
    accessorKey: "student_reading_level",
    header: "Reading Level",
    cell: ({ row, table }): JSX.Element => {
      const meta = table.options.meta as CustomTableMeta;
      const isEditing = meta.isEditing;

      return isEditing ? (
        <Select
          value={row.getValue("student_reading_level")}
          onValueChange={(value) =>
            meta.updateData(row.index, "student_reading_level", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        row.getValue("student_reading_level")
      );
    },
  },
];
