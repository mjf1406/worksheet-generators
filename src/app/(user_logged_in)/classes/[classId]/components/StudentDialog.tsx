// StudentDialog.tsx

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
import {
  addDefaultBehaviors,
  applyBehavior,
  createBehavior,
} from "../behaviorActions";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { useToast } from "~/components/ui/use-toast";
import useIsMobile from "~/app/(user_logged_in)/hooks";
import NumberInput from "~/components/ui/NumberInput";
import type { Behavior, RewardItem } from "~/server/db/types";
import CreateRewardItemDialog, {
  type RewardItemData,
} from "~/app/(user_logged_in)/tools/points/components/CreateRewardItemDialog";
import {
  createRewardItem,
  applyRewardItem,
  addDefaultRewardItems,
} from "../rewardItemActions"; // Import applyRewardItem
import RewardItemsGrid from "./RewardItemsGrid";
import CustomDialogContent from "~/components/CustomDialogContent";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface StudentDialogProps {
  studentId: string;
  classId: string;
  onClose: () => void;
}

const behaviorFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  title: z.string().optional(),
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
  class_id: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  isPositive: z.boolean().optional(),
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
  const [isCreateRewardItemDialogOpen, setIsCreateRewardItemDialogOpen] =
    useState(false);
  const [loadingBehaviorId, setLoadingBehaviorId] = useState<string | null>(
    null,
  );
  const [loadingRewardItemId, setLoadingRewardItemId] = useState<string | null>(
    null,
  ); // New state for reward items
  const { toast } = useToast();
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);
  const studentData = courseData?.students?.find(
    (student) => student.student_id === studentId,
  );

  const positiveBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value >= 1,
  ) as Behavior[];
  const negativeBehaviors = courseData?.behaviors?.filter(
    (behavior) => behavior.point_value <= -1,
  ) as Behavior[];
  const rewardItems = courseData?.reward_items as RewardItem[];

  const negativePoints =
    studentData?.point_history
      ?.filter((record) => record.number_of_points <= 0)
      .reduce((sum, record) => sum + record.number_of_points, 0) ?? 0;

  const positivePoints =
    studentData?.point_history
      ?.filter((record) => record.number_of_points >= 1)
      .reduce((sum, record) => sum + record.number_of_points, 0) ?? 0;

  const redemptionSum =
    studentData?.redemption_history.reduce(
      (sum, record) => sum + record.quantity,
      0,
    ) ?? 0;

  const [inputQuantity, setInputQuantity] = useState<number>(1); // State for custom quantity

  // Existing function to handle behavior selection
  const handleBehaviorSelect = async (behavior_id: string): Promise<void> => {
    setLoadingBehaviorId(behavior_id);
    const classId = courseData?.class_id;
    try {
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

  const handleCreateRewardItem = async (
    rewardItem: RewardItemData,
  ): Promise<void> => {
    try {
      const result = await createRewardItem(rewardItem);

      if (result.success) {
        await queryClient.invalidateQueries(classesOptions);
        setIsCreateRewardItemDialogOpen(false);
      } else {
        console.error("Error creating reward item:", result.message);
        toast({
          title: "Error",
          description: `Failed to create reward item: ${result.message}! Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating reward item:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while creating the reward item. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // New function to handle reward item selection
  const handleRewardItemSelect = async (item_id: string): Promise<void> => {
    setLoadingRewardItemId(item_id);
    const classId = courseData?.class_id;
    try {
      console.log("🚀 ~ handleRewardItemSelect ~ item_id:", item_id);
      const result = await applyRewardItem(
        item_id,
        [studentData!],
        classId!,
        inputQuantity,
      );
      if (result.success) {
        await queryClient.invalidateQueries(classesOptions);
        onClose();
      } else {
        console.error("Error applying reward item:", result.message);
        toast({
          title: "Error",
          description: `Failed to redeem reward item: ${result.message}! Please try again.`,
        });
      }
    } catch (error) {
      console.error("Error applying reward item:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while redeeming the reward item. Please try again.`,
      });
    } finally {
      setLoadingRewardItemId(null);
    }
  };

  const isMobile = useIsMobile(); // Use the hook here

  const refreshBehaviors = () => {
    void queryClient.invalidateQueries(classesOptions);
  };

  const refreshRewardItems = () => {
    void queryClient.invalidateQueries(classesOptions);
  };

  const mainContent = (
    <>
      <div className="absolute left-1 top-1 text-xl">
        #{studentData?.student_number}
      </div>
      {/* Main Content */}
      <div className="m-auto flex w-full flex-col items-center justify-center gap-5">
        <div className="text-2xl">
          <FontAwesomeIcon
            icon={["fas", "trophy"]}
            className="mr-2 text-yellow-500"
          />
          {studentData?.points ?? 0}
        </div>
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
              icon={["fas", "gift"]}
              className="mr-2 text-blue-500"
            />
            -{redemptionSum}
          </div>
        </div>
        <Tabs
          defaultValue="award"
          className="m-auto flex w-full flex-col items-center justify-center"
        >
          <TabsList className="bg-foreground/20">
            <TabsTrigger value="award">
              <FontAwesomeIcon icon={["fas", "award"]} className="mr-2" />
              Award Points
            </TabsTrigger>
            <TabsTrigger value="remove">
              <FontAwesomeIcon icon={["fas", "flag"]} className="mr-2" /> Remove
              Points
            </TabsTrigger>
            <TabsTrigger value="redeem">
              <FontAwesomeIcon icon={["fas", "gift"]} className="mr-2" /> Redeem
              Points
            </TabsTrigger>
          </TabsList>
          <TabsContent value="award">
            {positiveBehaviors && positiveBehaviors.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateBehaviorDialogOpen(true);
                    }}
                  >
                    Create Behavior
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultBehaviors(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                {/* Optional: Add NumberInput to specify custom quantity */}
                <div className="flex items-center gap-2">
                  <span>Quantity</span>
                  <NumberInput
                    value={inputQuantity}
                    onChange={setInputQuantity}
                    min={1}
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateBehaviorDialogOpen(true);
                    }}
                  >
                    Create Behavior
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultBehaviors(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                <p>No positive behaviors created yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="remove">
            {negativeBehaviors && negativeBehaviors.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateBehaviorDialogOpen(true);
                    }}
                  >
                    Create Behavior
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultBehaviors(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                {/* Optional: Add NumberInput to specify custom quantity */}
                <div className="flex items-center gap-2">
                  <span>Quantity</span>
                  <NumberInput
                    value={inputQuantity}
                    onChange={setInputQuantity}
                    min={1}
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateBehaviorDialogOpen(true);
                    }}
                  >
                    Create Behavior
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultBehaviors(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                <p>No negative behaviors created yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="redeem">
            {rewardItems && rewardItems.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateRewardItemDialogOpen(true);
                    }}
                  >
                    Create Reward Item
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultRewardItems(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                {/* Optional: Add NumberInput to specify quantity */}
                <div className="flex items-center gap-2">
                  <span>Quantity</span>
                  <NumberInput
                    value={inputQuantity}
                    onChange={setInputQuantity}
                    min={1}
                    step={1}
                    name="inputQuantity"
                    id="inputQuantity"
                  />
                </div>
                <RewardItemsGrid
                  rewardItems={rewardItems}
                  onRewardItemSelect={handleRewardItemSelect}
                  loadingItemId={loadingRewardItemId}
                  refreshRewardItems={refreshRewardItems}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsCreateRewardItemDialogOpen(true);
                    }}
                  >
                    Create Reward Item
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      void addDefaultRewardItems(classId);
                    }}
                  >
                    Add Defaults
                  </Button>
                </div>
                <p>No reward items created yet.</p>
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
                <div>{studentData?.student_name_en}</div>
                <Button asChild variant={"outline"}>
                  <Link
                    key={studentData?.student_id}
                    href={`/classes/${courseData?.class_id}/dashboard/${studentData?.student_id}`}
                  >
                    <LayoutDashboard className="mr-2 h-3 w-3 md:h-5 md:w-5" />{" "}
                    {studentData?.student_name_en} Dashboard
                  </Link>
                </Button>
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
          <CustomDialogContent className="w-full rounded-xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl">
            <DialogHeader>
              <DialogTitle className="mt-5 text-center text-2xl">
                <div>{studentData?.student_name_en}</div>
                <Button asChild variant={"outline"}>
                  <Link
                    key={studentData?.student_id}
                    href={`/classes/${courseData?.class_id}/dashboard/${studentData?.student_id}`}
                  >
                    <LayoutDashboard className="mr-2 h-3 w-3 md:h-5 md:w-5" />{" "}
                    {studentData?.student_name_en} Dashboard
                  </Link>
                </Button>
              </DialogTitle>
              <DialogDescription className="text-center">
                Award and remove points based on student behaviors.
              </DialogDescription>
            </DialogHeader>
            {mainContent}
            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </CustomDialogContent>
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
      {isCreateRewardItemDialogOpen && (
        <CreateRewardItemDialog
          open={isCreateRewardItemDialogOpen}
          onClose={() => setIsCreateRewardItemDialogOpen(false)}
          onCreateRewardItem={handleCreateRewardItem}
          classId={classId}
        />
      )}
    </>
  );
};

export default StudentDialog;
