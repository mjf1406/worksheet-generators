// components/StudentDialog.tsx

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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import BehaviorsGrid from "./BehaviorsGrid";
import CreateBehaviorDialog from "./CreateBehaviorDialog";
import { applyBehavior, createBehavior } from "../actions";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { useToast } from "~/components/ui/use-toast";
import useIsMobile from "~/app/(user_logged_in)/hooks";
import NumberInput from "~/components/ui/NumberInput";

interface StudentDialogProps {
  studentId: string;
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

const StudentDialog: React.FC<StudentDialogProps> = ({
  studentId,
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
  const studentData = courseData?.students?.find(
    (student) => student.student_id === studentId,
  );

  const positiveBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value >= 1,
  );
  const negativeBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value <= -1,
  );

  const negativePoints =
    studentData?.point_history
      ?.filter((record) => record.quantity <= 0)
      .reduce((sum, record) => sum + record.quantity, 0) ?? 0;

  const positivePoints =
    studentData?.point_history
      ?.filter((record) => record.quantity >= 1)
      .reduce((sum, record) => sum + record.quantity, 0) ?? 0;

  const [inputQuantity, setInputQuantity] = useState<number>(1); // State for custom point value

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

  const handleBehaviorSelect = async (behavior_id: string): Promise<void> => {
    setLoadingBehaviorId(behavior_id);
    const classId = courseData?.class_id;
    try {
      console.log("🚀 ~ handleBehaviorSelect ~ behavior_id:", behavior_id);
      const result = await applyBehavior(
        behavior_id,
        [studentData!],
        classId!,
        inputQuantity,
      );
      if (result.success) {
        await queryClient.invalidateQueries(classesOptions);
        onClose();
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

  const mainContent = (
    <>
      <div className="absolute left-1 top-1 text-xl">
        #{studentData?.student_number}
      </div>
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="flex gap-16">
          <div>
            <FontAwesomeIcon
              icon={["fas", "award"]}
              className="mr-2 text-green-600"
            />
            {positivePoints}
          </div>
          <div>
            <FontAwesomeIcon
              icon={["fas", "flag"]}
              className="mr-2 text-red-500"
            />
            {negativePoints}
          </div>
          <div>
            <FontAwesomeIcon
              icon={["fas", "trophy"]}
              className="mr-2 text-yellow-500"
            />
            {studentData?.points ?? 0}
          </div>
        </div>
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
                {/* Optional: Add NumberInput to specify custom point value */}
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
                {/* Optional: Add NumberInput to specify custom point value */}
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
        <Drawer
          open={true} // Always open when rendered
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="mt-5 text-center text-2xl">
                {studentData?.student_name_en}
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
        <Dialog
          open={true} // Always open when rendered
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mt-5 text-center text-2xl">
                {studentData?.student_name_en}
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

export default StudentDialog;
