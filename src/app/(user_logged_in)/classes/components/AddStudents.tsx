"use client";

import { studentSchema } from "../[classId]/addStudents";
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

interface AddStudentsDialogProps {
  classId: string;
  existingStudents: Student[];
  onStudentsAdded: (newStudents: Student[]) => void;
}

const initialStudentState: Partial<Student> = {
  student_name_en: "",
  student_name_alt: "",
  student_reading_level: "",
  student_grade: "",
  student_sex: undefined,
  student_email: "",
};

const gradeOptions = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

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
      // Validate each student against the schema
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
        <Button>
          <Plus className="mr-2 h-6 w-6" /> Add student(s)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Students</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (EN)*</TableHead>
                <TableHead>Name (Alt)</TableHead>
                <TableHead>Sex*</TableHead>
                <TableHead>Grade*</TableHead>
                <TableHead>Reading Level*</TableHead>
                <TableHead>Email</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newStudents.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      required
                      value={student.student_name_en}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "student_name_en",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={student.student_name_alt}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "student_name_alt",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      required
                      value={student.student_sex}
                      onValueChange={(value) =>
                        handleInputChange(index, "student_sex", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      required
                      value={student.student_grade}
                      onValueChange={(value) =>
                        handleInputChange(index, "student_grade", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      required
                      value={student.student_reading_level}
                      onValueChange={(value) =>
                        handleInputChange(index, "student_reading_level", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Reading Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="email"
                      value={student.student_email!}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "student_email",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
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
        <div className="mt-4 flex justify-between">
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
