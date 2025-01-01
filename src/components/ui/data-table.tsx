"use client";

import React, { useState, useCallback, useTransition } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/use-toast";
import {
  ChevronDown,
  Pencil,
  Save,
  StepBack,
  StepForward,
  X,
} from "lucide-react";
import type { Student } from "~/server/db/types";
import { updateStudents } from "~/app/(user_logged_in)/classes/[classId]/updateStudents";
import type { TableMeta } from "@tanstack/react-table";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

export interface CustomTableMeta extends TableMeta<Student> {
  isEditing: boolean;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

interface DataTableProps {
  data: StudentData[] | undefined;
  columns: ColumnDef<StudentData>[];
}

export function DataTable({ data, columns }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [tableData, setTableData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [changedRows, setChangedRows] = useState<
    Record<string, Partial<Student>>
  >({});
  const [isPending, startTransition] = useTransition();

  const updateData = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setTableData((old) =>
        old?.map((row, index) => {
          if (index === rowIndex) {
            const updatedRow = {
              ...old[rowIndex]!,
              [columnId]: value,
            };
            setChangedRows((prev) => ({
              ...prev,
              [updatedRow.student_id]: {
                ...prev[updatedRow.student_id],
                [columnId]: value,
              },
            }));
            return updatedRow;
          }
          return row;
        }),
      );
    },
    [],
  );

  const handleSave = () => {
    startTransition(async () => {
      const changedStudents = Object.entries(changedRows).map(
        ([studentId, changes]) => ({
          student_id: studentId,
          ...changes,
        }),
      );

      const result = await updateStudents(changedStudents);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsEditing(false);
        setChangedRows({});
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTableData(data);
    setChangedRows({});
  };

  const table = useReactTable<StudentData>({
    data: tableData!,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData,
      isEditing,
    } as CustomTableMeta,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter students..."
          value={
            (table
              .getColumn("student_name_first_en")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("student_name_first_en")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="ml-2" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="ml-2"
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant={"outline"}
            onClick={() => setIsEditing(true)}
            className="ml-2"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        <div className="ml-2 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <StepBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <StepForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  );
}
