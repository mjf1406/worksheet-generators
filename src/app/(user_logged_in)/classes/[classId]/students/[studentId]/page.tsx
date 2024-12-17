// pages/studentDashboard.tsx

import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import { APP_NAME, conversationStarters } from "~/lib/constants";
import { db } from "~/server/db";
import {
  assignments,
  behaviors,
  classes,
  points,
  reward_items,
  student_assignments,
  students,
} from "~/server/db/schema";
import AssignmentTable from "./components/StudentAssignmentsTable";
import PointsCard from "./components/PointsCard";
import StudentBehaviorLeadersCard from "./components/StudentBehaviorLeadersCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import RewardItemsViewGrid from "./components/RewardItemsViewGrid";

interface Params {
  classId: string;
  studentId: string;
}

interface StudentAssignmentWithDetails {
  sa_id: string;
  sa_user_id: string;
  sa_class_id: string;
  sa_student_id: string;
  sa_assignment_id: string;
  sa_complete: boolean;
  sa_completed_ts: string | null;
  assignment_name: string;
  assignment_description: string | null;
  assignment_data: string | null;
  due_date: string | null;
  topic: string | null;
  working_date: string | null;
  created_date: string;
  updated_date: string;
}

// PointClient type as defined in PointsCard
type PointClient = {
  id: string;
  type: "positive" | "negative" | "redemption";
  number_of_points: number;
  behavior_name: string | null | undefined;
  reward_item_name: string | null | undefined;
  created_date: string;
};

// Helper function to extract the first name
const getFirstName = (fullName: string | null | undefined): string => {
  if (!fullName?.trim()) return "Student";
  const nameParts = fullName.trim().split(" ");
  return nameParts[1] ?? "Student";
};

// Function to get a random conversation starter
const getRandomConversationStarter = (): string => {
  const randomIndex = Math.floor(Math.random() * conversationStarters.length);
  return conversationStarters[randomIndex]?.text ?? "";
};

// Add this line before the return statement in your component
const randomConversationStarter = getRandomConversationStarter();

export default async function studentDashboard({ params }: { params: Params }) {
  const { classId, studentId } = params;

  // Ensure classId and studentId are defined
  if (!classId || !studentId) {
    return <div className="p-5 pl-10 text-red-500">Invalid parameters.</div>;
  }

  const [
    classData,
    studentData,
    rawStudentAssignments,
    allClassPointsData,
    rewardItems,
  ] = await Promise.all([
    // classData
    db.select().from(classes).where(eq(classes.class_id, classId)).limit(1),
    // studentData
    db
      .select()
      .from(students)
      .where(eq(students.student_id, studentId))
      .limit(1),
    // rawStudentAssignments
    db
      .select({
        sa_id: student_assignments.id,
        sa_user_id: student_assignments.user_id,
        sa_class_id: student_assignments.class_id,
        sa_student_id: student_assignments.student_id,
        sa_assignment_id: student_assignments.assignment_id,
        sa_complete: student_assignments.complete,
        sa_completed_ts: student_assignments.completed_ts,
        // Assignment Details
        assignment_name: assignments.name,
        assignment_description: assignments.description,
        assignment_data: assignments.data,
        due_date: assignments.due_date,
        topic: assignments.topic,
        working_date: assignments.working_date,
        created_date: assignments.created_date,
        updated_date: assignments.updated_date,
      })
      .from(student_assignments)
      .innerJoin(
        assignments,
        eq(student_assignments.assignment_id, assignments.id),
      )
      .where(
        and(
          eq(student_assignments.student_id, studentId),
          eq(student_assignments.class_id, classId),
        ),
      ),
    db
      .select({
        id: points.id,
        student_id: points.student_id,
        behavior_id: points.behavior_id,
        type: points.type,
        number_of_points: points.number_of_points,
        created_date: points.created_date,
        behavior_name: behaviors.name,
        reward_item_name: reward_items.name,
      })
      .from(points)
      .leftJoin(behaviors, eq(behaviors.behavior_id, points.behavior_id))
      .leftJoin(reward_items, eq(reward_items.item_id, points.reward_item_id))
      .where(eq(points.class_id, classId)),
    db
      .select({
        price: reward_items.price,
        name: reward_items.name,
        description: reward_items.description,
        icon: reward_items.icon,
      })
      .from(reward_items)
      .where(eq(reward_items.class_id, classId)),
  ]);

  const studentAssignments: StudentAssignmentWithDetails[] =
    rawStudentAssignments.map((assignment) => ({
      ...assignment,
      sa_complete: assignment.sa_complete ?? false,
    }));

  // Validate studentData existence
  if (studentData.length === 0) {
    return <div className="p-5 pl-10 text-red-500">Student not found.</div>;
  }

  // Validate classData existence
  if (classData.length === 0) {
    return <div className="p-5 pl-10 text-red-500">Class not found.</div>;
  }

  const student = studentData[0];

  // Aggregate points by (behavior_id, student_id)
  const behaviorMap = new Map<string, Map<string, number>>();
  const behaviorTypeMap = new Map<
    string,
    { behavior_name: string; type: string }
  >();

  for (const p of allClassPointsData) {
    if (!p.behavior_id || !p.behavior_name) continue;
    const behaviorKey = p.behavior_id;
    if (!behaviorMap.has(behaviorKey)) {
      behaviorMap.set(behaviorKey, new Map());
      behaviorTypeMap.set(behaviorKey, {
        behavior_name: p.behavior_name,
        type: p.type,
      });
    }
    const studentPoints = behaviorMap.get(behaviorKey)!;
    const currentPoints = studentPoints.get(p.student_id) ?? 0;
    studentPoints.set(p.student_id, currentPoints + (p.number_of_points ?? 0));
  }

  // Adjust the interface to include otherStudentsCount
  interface BehaviorRankAggregate {
    behavior: string;
    type: string;
    totalPoints: number;
    otherStudentsCount?: number; // optional field
  }

  const topPositiveBehaviors: BehaviorRankAggregate[] = [];
  const topNegativeBehaviors: BehaviorRankAggregate[] = [];

  for (const [behaviorKey, studentScores] of behaviorMap.entries()) {
    const { behavior_name, type } = behaviorTypeMap.get(behaviorKey)!;
    if (!behavior_name) continue;

    const entries = Array.from(studentScores.entries()); // [ [student_id, totalPoints], ... ]

    if (type === "positive") {
      // max is #1
      const maxPoints = Math.max(...entries.map(([_, pts]) => pts));
      const topStudents = entries
        .filter(([_, pts]) => pts === maxPoints)
        .map(([id]) => id);

      if (topStudents.includes(studentId)) {
        // other students besides our student
        const otherStudentsCount = topStudents.length - 1;
        topPositiveBehaviors.push({
          behavior: behavior_name,
          type,
          totalPoints: maxPoints,
          otherStudentsCount,
        });
      }
    } else if (type === "negative") {
      // min is #1
      const minPoints = Math.min(...entries.map(([_, pts]) => pts));
      const bottomStudents = entries
        .filter(([_, pts]) => pts === minPoints)
        .map(([id]) => id);

      if (bottomStudents.includes(studentId)) {
        const otherStudentsCount = bottomStudents.length - 1;
        topNegativeBehaviors.push({
          behavior: behavior_name,
          type,
          totalPoints: minPoints,
          otherStudentsCount,
        });
      }
    }
  }

  // Map allClassPointsData to PointClient for PointsCard
  const mappedPointsData: PointClient[] = allClassPointsData.map((p) => ({
    id: p.id,
    type: p.type,
    number_of_points: p.number_of_points ?? 0,
    behavior_name: p.behavior_name ?? null,
    reward_item_name: p.reward_item_name ?? null,
    created_date: p.created_date ?? new Date().toISOString(),
  }));

  return (
    <main>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="relative col-span-1 -ml-6 -mt-5 aspect-square w-full">
          <Image
            src="/assets/img/monkey-hanging-from-branch.png"
            alt="Monkey hanging from branch"
            fill
            className="object-cover"
            priority
          />
        </div>
        <Card className="col-span-1 mb-5 h-fit md:col-span-4">
          <CardHeader>
            <CardTitle>
              Hey there, {getFirstName(student?.student_name_en)}!
            </CardTitle>
            <CardDescription className="text-gray-500">
              Ask or discuss with your desk partner/teammate this
              question/sentence for bonus points: {randomConversationStarter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Welcome to your ClassQuest dashboard! Check out all the cards
              below to see what&apos;s going on.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-1">
          <AssignmentTable assignments={studentAssignments} />
        </div>
        <div className="md:col-span-1">
          <PointsCard
            pointsData={mappedPointsData.filter((pData) => {
              const originalItem = allClassPointsData.find(
                (orig) => orig.id === pData.id,
              );
              return originalItem?.student_id === studentId;
            })}
          />
        </div>
        <div className="md:col-span-1">
          <StudentBehaviorLeadersCard
            topPositive={topPositiveBehaviors}
            topNegative={topNegativeBehaviors}
          />
        </div>
        <div className="col-span-3">
          <RewardItemsViewGrid rewardItems={rewardItems} />
        </div>
      </div>
    </main>
  );
}
