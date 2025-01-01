import { Plus } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { addGroup } from "../[classId]/createGroup";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "~/components/ui/use-toast";
import type { Group } from "~/server/db/types";

interface AddGroupDialogProps {
  students: StudentData[] | undefined;
  onGroupAdded: (newGroup: Group) => void;
  classId: string;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({
  students,
  onGroupAdded,
  classId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, boolean>
  >({});

  const selectedCount = useMemo(() => {
    return Object.values(selectedStudents).filter(Boolean).length;
  }, [selectedStudents]);

  const addGroupMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addGroup(formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: async (result) => {
      toast({
        title: "Success",
        description: "Group created successfully",
      });

      onGroupAdded(result.newGroup!);

      await queryClient.invalidateQueries({ queryKey: ["groups", classId] });
      await queryClient.refetchQueries({ queryKey: ["groups", classId] });
      await queryClient.invalidateQueries({ queryKey: ["classes"] });

      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create group:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("classId", classId);
    Object.keys(selectedStudents).forEach((id) => {
      if (selectedStudents[id]) {
        formData.append("studentIds", id);
      }
    });
    addGroupMutation.mutate(formData);
  };

  const handleStudentCheck = (studentId: string | undefined) => {
    if (!studentId) return;
    setSelectedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedStudents({});
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
              {students?.map((student) => (
                <div
                  key={student.student_id}
                  className="col-span-1 flex items-center gap-2"
                >
                  <Checkbox
                    id={`student-${student.student_id}`}
                    checked={selectedStudents[student.student_id] ?? false}
                    onCheckedChange={() =>
                      handleStudentCheck(student.student_id)
                    }
                  />
                  <Label htmlFor={`student-${student.student_id}`}>
                    {student.student_name_first_en}{" "}
                    {student.student_name_last_en}
                  </Label>
                </div>
              ))}
            </div>
            <div>Selected: {selectedCount}</div>
          </div>
          <Button type="submit" disabled={addGroupMutation.isPending}>
            {addGroupMutation.isPending ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;
