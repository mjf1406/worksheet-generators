// pages/studentDashboard.tsx

import { eq, and } from "drizzle-orm";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import { APP_NAME } from "~/lib/constants";
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
  // Assignment Details (excluding IDs)
  assignment_name: string;
  assignment_description: string | null;
  assignment_data: string | null;
  due_date: string | null;
  topic: string | null;
  working_date: string | null;
  created_date: string;
  updated_date: string;
}

// Helper function to extract the first name
const getFirstName = (fullName: string | null | undefined): string => {
  if (!fullName?.trim()) return "Student";
  const nameParts = fullName.trim().split(" ");
  return nameParts[1] ?? "Student";
};

export default async function studentDashboard({ params }: { params: Params }) {
  const { classId, studentId } = params;

  // Ensure classId and studentId are defined
  if (!classId || !studentId) {
    return <div className="p-5 pl-10 text-red-500">Invalid parameters.</div>;
  }

  // Fetch classData and studentData in parallel
  const [classData, studentData, rawStudentAssignments, pointsData] =
    await Promise.all([
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
          // Assignment Details (excluding IDs)
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
      // pointData
      db
        .select({
          id: points.id,
          type: points.type,
          number_of_points: points.number_of_points,
          created_date: points.created_date,
          behavior_name: behaviors.name,
          reward_item_name: reward_items.name,
        })
        .from(points)
        .leftJoin(behaviors, eq(behaviors.behavior_id, points.behavior_id))
        .leftJoin(reward_items, eq(reward_items.item_id, points.reward_item_id))
        .where(
          and(eq(points.class_id, classId), eq(points.student_id, studentId)),
        ),
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

  // Optionally, validate classData if you intend to use it
  if (classData.length === 0) {
    return <div className="p-5 pl-10 text-red-500">Class not found.</div>;
  }

  // Extract the first (and only) student from the array
  const student = studentData[0];

  return (
    <div className="h-dvh">
      <header className="flex items-center justify-between bg-white p-5 dark:bg-gray-600">
        <Link href="/" className="flex items-center gap-2">
          <Logo fill="hsl(var(--primary))" size="25" />
          <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {APP_NAME}
          </h1>
          <span className="ml-1 justify-start self-start text-xs text-orange-500">
            [ALPHA]
          </span>
        </Link>
        <ModeToggle />
      </header>
      <main className="h-full bg-accent/20 p-5 pl-10 font-serif dark:bg-gray-900">
        {/* Header Section */}

        {/* Welcome Section */}
        <section className="mb-8 rounded-md border-l-4 border-orange-500 bg-pink-100 p-6 shadow-lg dark:bg-pink-800">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            Hey there, {getFirstName(student!.student_name_en)}!
          </h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
            Welcome to your ClassQuest dashboard! Check out all the cards below
            to see what&apos;s going on.
          </p>
        </section>

        {/* Assignments Button */}
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">
          <AssignmentTable assignments={studentAssignments} />
          <PointsCard pointsData={pointsData} />
        </div>
      </main>
    </div>
  );
}
