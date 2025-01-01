"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Plus, X } from "lucide-react";
import type { Student } from "~/server/db/types";
import { addStudents } from "../[classId]/addStudents";
import { useToast } from "~/components/ui/use-toast";
import { GRADES } from "~/lib/constants";
import { z } from "zod";

const studentSchema = z.object({
  student_name_first_en: z.string().min(1, "First English name is required"),
  student_name_last_en: z.string().min(1, "Last English name is required"),
  student_name_alt: z.string().optional().nullable(),
  student_reading_level: z.string().min(1, "Reading level is required"),
  student_grade: z.string().min(1, "Grade is required"),
  student_sex: z.enum(["male", "female"], {
    required_error: "Sex is required",
  }),
  student_number: z.number().int().positive("Student number must be positive"),
  student_email: z.string().optional().nullable(),
  joined_date: z.string().optional(),
  updated_date: z.string().optional(),
});

interface AddStudentsDialogProps {
  classId: string;
  existingStudents: Student[];
  onStudentsAdded: (newStudents: Student[]) => void;
}

const initialStudentState: Partial<Student> = {
  student_name_first_en: "",
  student_name_last_en: "",
  student_name_alt: "",
  student_reading_level: "",
  student_grade: "",
  student_sex: undefined,
  student_email: "",
};

export function AddStudentsDialog({
  classId,
  existingStudents,
  onStudentsAdded,
}: AddStudentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStudents, setNewStudents] = useState<Partial<Student>[]>([
    { ...initialStudentState },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddStudent = () => {
    setNewStudents([...newStudents, { ...initialStudentState }]);
  };

  const handleRemoveStudent = (index: number) => {
    setNewStudents(newStudents.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    field: keyof Student,
    value: string,
  ) => {
    const updatedStudents = newStudents.map((student, i) =>
      i === index ? { ...student, [field]: value } : student,
    );
    setNewStudents(updatedStudents);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const lastStudentNumber = Math.max(
      ...existingStudents.map((s) => s.student_number ?? 0),
      0,
    );
    const studentsWithNumbers = newStudents.map((student, index) => ({
      ...student,
      student_number: lastStudentNumber + index + 1,
      student_name_alt: student.student_name_alt ?? null,
      student_email: student.student_email ?? null,
    }));

    try {
      const validatedStudents = studentsWithNumbers.map((student) => {
        const result = studentSchema.safeParse(student);
        if (!result.success) {
          throw new Error(`Invalid student data: ${result.error.message}`);
        }
        return result.data;
      });

      const result = await addStudents({
        classId,
        students: validatedStudents,
      });

      if (result.success) {
        onStudentsAdded(validatedStudents as Omit<Student, "student_id">[]);
        setNewStudents([{ ...initialStudentState }]);
        setIsOpen(false);
        toast({
          title: "Success",
          description: `Added ${validatedStudents.length} new student(s)`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        if (result.errors) {
          console.error("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error submitting students:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <Plus className="h-6 w-6 sm:mr-0 md:mr-2" />{" "}
          <span className="hidden sm:inline">Add student(s)</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Students</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    First Name (EN)*
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    Last Name (EN)*
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    Name (Alt)
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Sex*</TableHead>
                  <TableHead className="whitespace-nowrap">Grade*</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Reading Level*
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newStudents.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-2 py-1">
                      <Input
                        required
                        className="w-full"
                        value={student.student_name_first_en}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "student_name_first_en",
                            e.target.value,
                          )
                        }
                        placeholder="First Name"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Input
                        required
                        className="w-full"
                        value={student.student_name_last_en}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "student_name_last_en",
                            e.target.value,
                          )
                        }
                        placeholder="Last Name"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Input
                        className="w-full"
                        value={student.student_name_alt}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "student_name_alt",
                            e.target.value,
                          )
                        }
                        placeholder="Alternative Name"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Select
                        required
                        value={student.student_sex}
                        onValueChange={(value) =>
                          handleInputChange(index, "student_sex", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Select
                        required
                        value={student.student_grade}
                        onValueChange={(value) =>
                          handleInputChange(index, "student_grade", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Select
                        required
                        value={student.student_reading_level}
                        onValueChange={(value) =>
                          handleInputChange(
                            index,
                            "student_reading_level",
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Reading Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Input
                        type="email"
                        className="w-full"
                        value={student.student_email ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "student_email",
                            e.target.value,
                          )
                        }
                        placeholder="Email"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveStudent(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex flex-col justify-between space-y-2 md:flex-row md:space-y-0">
          <Button variant={"secondary"} onClick={handleAddStudent}>
            Add Another Student
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
