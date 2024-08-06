import { Plus } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Student } from "~/server/db/types";
import { addGroup } from "../[classId]/createGroup";
import { useRouter } from "next/navigation";

interface AddGroupDialogProps {
  students: Student[];
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ students }) => {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = useMemo(() => {
    return Object.values(selectedStudents).filter(Boolean).length;
  }, [selectedStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("classId", classId);
    Object.keys(selectedStudents).forEach((id) => {
      if (selectedStudents[id]) {
        formData.append("studentIds", id);
      }
    });

    try {
      const result = await addGroup(formData);
      if (result.error) {
        setError(result.error);
      } else {
        // Handle success
        console.log(result.message);
        setIsOpen(false);
        router.prefetch(`/classes/${classId}`);
        router.push(`/classes/${classId}`);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentCheck = (studentId: string | undefined) => {
    if (!studentId) return;
    setSelectedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-6 w-6" /> Add group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Students</Label>
            <div className="grid grid-cols-2 gap-2">
              {students.map((student) => (
                <div
                  key={student.student_id}
                  className="col-span-1 flex items-center gap-2"
                >
                  <Checkbox
                    id={`student-${student.student_id}`}
                    checked={selectedStudents[student.student_id!] ?? false}
                    onCheckedChange={() =>
                      handleStudentCheck(student.student_id)
                    }
                  />
                  <Label htmlFor={`student-${student.student_id}`}>
                    {student.student_name_en}
                  </Label>
                </div>
              ))}
            </div>
            <div>Selected: {selectedCount}</div>
          </div>
          {error && <p className="rounded-lg bg-destructive p-2">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;
