// components/EditStudentDialog.tsx

"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { updateStudent } from "../actions";
import { useToast } from "~/components/ui/use-toast";

interface EditStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData;
  onUpdate: (updatedStudent: StudentData) => void;
}

const studentSchema = z.object({
  student_name_first_en: z.string().min(1, "First English name is required"),
  student_name_last_en: z.string().min(1, "Last English name is required"),
  student_name_alt: z.string().optional(),
  student_reading_level: z.string().optional(),
  student_grade: z.string().optional(),
  student_sex: z.enum(["male", "female"]),
  student_number: z.number().int().positive("Student number must be positive"),
  student_email: z.string().email("Invalid email address"),
});

type StudentFormData = z.infer<typeof studentSchema>;

const EditStudentDialog: React.FC<EditStudentDialogProps> = ({
  isOpen,
  onClose,
  student,
  onUpdate,
}) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student_name_first_en: student.student_name_first_en,
      student_name_last_en: student.student_name_last_en,
      student_name_alt: student.student_name_alt ?? "",
      student_reading_level: student.student_reading_level ?? "",
      student_grade: student.student_grade ?? "",
      student_sex: student.student_sex ?? undefined,
      student_number: student.student_number ?? undefined,
      student_email: student.student_email ?? "",
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      const updatedStudentResponse: {
        success: boolean;
        message: string;
        data: StudentData | null;
      } = await updateStudent({
        student_id: student.student_id,
        ...data,
      });
      if (updatedStudentResponse.success && updatedStudentResponse.data) {
        onUpdate({
          ...updatedStudentResponse.data,
          points: student.points,
          point_history: student.point_history,
          absent_dates: student.absent_dates,
        });
        onClose();
        toast({
          title: "Success",
          description: "Student updated successfully.",
        });
      } else {
        throw new Error(updatedStudentResponse.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error!",
        description: `Failed to update student. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Modify the student details below. All fields except ID are editable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium">Student ID</label>
            <Input value={student.student_id} readOnly className="mt-1" />
          </div>

          {/* First English Name */}
          <div>
            <label className="block text-sm font-medium">
              First Name (EN)*
            </label>
            <Input
              {...register("student_name_first_en")}
              className="mt-1"
              placeholder="Enter first English name"
            />
            {errors.student_name_first_en && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_name_first_en.message}
              </p>
            )}
          </div>

          {/* Last English Name */}
          <div>
            <label className="block text-sm font-medium">Last Name (EN)*</label>
            <Input
              {...register("student_name_last_en")}
              className="mt-1"
              placeholder="Enter last English name"
            />
            {errors.student_name_last_en && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_name_last_en.message}
              </p>
            )}
          </div>

          {/* Alternate Name */}
          <div>
            <label className="block text-sm font-medium">Alternate Name</label>
            <Input
              {...register("student_name_alt")}
              className="mt-1"
              placeholder="Enter alternate name"
            />
            {errors.student_name_alt && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_name_alt.message}
              </p>
            )}
          </div>

          {/* Reading Level */}
          <div>
            <label className="block text-sm font-medium">Reading Level</label>
            <Input
              {...register("student_reading_level")}
              className="mt-1"
              placeholder="Enter reading level"
            />
            {errors.student_reading_level && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_reading_level.message}
              </p>
            )}
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium">Grade</label>
            <Input
              {...register("student_grade")}
              className="mt-1"
              placeholder="Enter grade"
            />
            {errors.student_grade && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_grade.message}
              </p>
            )}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium">Sex*</label>
            <Controller
              control={control}
              name="student_sex"
              render={({ field }) => (
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.student_sex && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_sex.message}
              </p>
            )}
          </div>

          {/* Student Number */}
          <div>
            <label className="block text-sm font-medium">Student Number*</label>
            <Input
              type="number"
              {...register("student_number", { valueAsNumber: true })}
              className="mt-1"
              placeholder="Enter student number"
            />
            {errors.student_number && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_number.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              {...register("student_email")}
              className="mt-1"
              placeholder="Enter email"
            />
            {errors.student_email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.student_email.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;
