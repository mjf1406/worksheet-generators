// components/ApplyBehaviorDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import BehaviorsGrid from "./BehaviorsGrid";
import CreateBehaviorDialog from "./CreateBehaviorDialog";
import { applyBehavior, createBehavior } from "../behaviorActions";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { useToast } from "~/components/ui/use-toast";
import useIsMobile from "~/app/(user_logged_in)/hooks";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import NumberInput from "~/components/ui/NumberInput";
import type { Behavior } from "~/server/db/types";

interface ApplyBehaviorDialogProps {
  selectedStudents: StudentData[];
  classId: string;
  onClose: () => void;
}

const behaviorFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  point_value: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().int(),
  ),
  description: z.string().optional(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .nullable(),
  color: z.string(),
});

export type BehaviorData = z.infer<typeof behaviorFormSchema>;

const ApplyBehaviorDialog: React.FC<ApplyBehaviorDialogProps> = ({
  selectedStudents,
  classId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isCreateBehaviorDialogOpen, setIsCreateBehaviorDialogOpen] =
    useState(false);
  const [loadingBehaviorId, setLoadingBehaviorId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);

  const positiveBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value >= 1,
  ) as Behavior[];
  const negativeBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value <= -1,
  ) as Behavior[];

  const handleCreateBehavior = async (
    newBehavior: BehaviorData,
  ): Promise<void> => {
    try {
      const result = await createBehavior(newBehavior);

      if (result.success) {
        await queryClient.invalidateQueries(classesOptions);
        setIsCreateBehaviorDialogOpen(false);
      } else {
        console.error("Error creating behavior:", result.message);
        toast({
          title: "Error",
          description: `Failed to create behavior: ${result.message}! Please try again.`,
        });
      }
    } catch (error) {
      console.error("Error creating behavior:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while creating the behavior. Please try again.`,
      });
    }
  };

  const [inputQuantity, setInputQuantity] = useState<number>(1); // State for custom point value

  const handleBehaviorSelect = async (behavior_id: string): Promise<void> => {
    setLoadingBehaviorId(behavior_id);
    try {
      const result = await applyBehavior(
        behavior_id,
        selectedStudents,
        classId,
        inputQuantity,
      );

      if (result.success) {
        await queryClient.invalidateQueries(classesOptions);
        onClose();
        toast({
          title: "Success",
          description:
            "Behavior applied successfully to all selected students.",
        });
      } else {
        console.error("Error applying behavior:", result.message);
        toast({
          title: "Error",
          description: `Failed to apply behavior: ${result.message}! Please try again.`,
        });
      }
    } catch (error) {
      console.error("Error applying behavior:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while applying the behavior. Please try again.`,
      });
    } finally {
      setLoadingBehaviorId(null);
    }
  };

  const isMobile = useIsMobile(); // Use the hook here

  const refreshBehaviors = () => {
    void queryClient.invalidateQueries(classesOptions);
  };

  // Sort selected students alphabetically by name
  const sortedSelectedStudents = [...selectedStudents].sort((a, b) =>
    a.student_name_en.localeCompare(b.student_name_en),
  );

  const mainContent = (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Selected Students:</h3>
        <div className="grid grid-cols-2">
          {sortedSelectedStudents.map((student) => (
            <div className="col-span-1" key={student.student_id}>
              {student.student_name_en}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
        <Tabs
          defaultValue="award"
          className="m-auto flex w-full flex-col items-center justify-center"
        >
          <TabsList className="bg-foreground/20">
            <TabsTrigger value="award">Award Points</TabsTrigger>
            <TabsTrigger value="remove">Remove Points</TabsTrigger>
          </TabsList>
          <TabsContent value="award">
            {positiveBehaviors && positiveBehaviors.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5">
                <Button
                  onClick={() => {
                    setIsCreateBehaviorDialogOpen(true);
                  }}
                >
                  Create Behavior
                </Button>
                {/* Add NumberInput to specify custom point value */}
                <div className="flex items-center gap-2">
                  <span>Quantity</span>
                  <NumberInput
                    value={inputQuantity}
                    onChange={setInputQuantity}
                    min={1}
                    max={10}
                    step={1}
                    name="inputQuantity"
                    id="inputQuantity"
                  />
                </div>
                <BehaviorsGrid
                  behaviors={positiveBehaviors}
                  onBehaviorSelect={handleBehaviorSelect}
                  loadingBehaviorId={loadingBehaviorId}
                  refreshBehaviors={refreshBehaviors}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5">
                <Button
                  onClick={() => {
                    setIsCreateBehaviorDialogOpen(true);
                  }}
                >
                  Create Behavior
                </Button>
                <p>No positive behaviors created yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="remove">
            {negativeBehaviors && negativeBehaviors.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5">
                <Button
                  onClick={() => {
                    setIsCreateBehaviorDialogOpen(true);
                  }}
                >
                  Create Behavior
                </Button>
                {/* Add NumberInput to specify custom point value */}
                <div className="flex items-center gap-2">
                  <span>Quantity</span>
                  <NumberInput
                    value={inputQuantity}
                    onChange={setInputQuantity}
                    min={1}
                    max={10}
                    step={1}
                    name="inputQuantity"
                    id="inputQuantity"
                  />
                </div>
                <BehaviorsGrid
                  behaviors={negativeBehaviors}
                  onBehaviorSelect={handleBehaviorSelect}
                  loadingBehaviorId={loadingBehaviorId}
                  refreshBehaviors={refreshBehaviors}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5">
                <Button
                  onClick={() => {
                    setIsCreateBehaviorDialogOpen(true);
                  }}
                >
                  Create Behavior
                </Button>
                <p>No negative behaviors created yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="mt-5 text-center text-2xl">
                Apply Behavior to {sortedSelectedStudents.length} Student(s)
              </DrawerTitle>
              <DrawerDescription className="text-center">
                Award and remove points based on student behaviors.
              </DrawerDescription>
            </DrawerHeader>
            {mainContent}
            <DrawerFooter>
              <Button onClick={onClose}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open onOpenChange={() => onClose()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mt-5 text-center text-2xl">
                Apply Behavior to {sortedSelectedStudents.length} Student(s)
              </DialogTitle>
              <DialogDescription className="text-center">
                Award and remove points based on student behaviors.
              </DialogDescription>
            </DialogHeader>
            {mainContent}
            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isCreateBehaviorDialogOpen && (
        <CreateBehaviorDialog
          open={isCreateBehaviorDialogOpen}
          onClose={() => setIsCreateBehaviorDialogOpen(false)}
          onCreateBehavior={handleCreateBehavior}
          classId={classId}
        />
      )}
    </>
  );
};

export default ApplyBehaviorDialog;
