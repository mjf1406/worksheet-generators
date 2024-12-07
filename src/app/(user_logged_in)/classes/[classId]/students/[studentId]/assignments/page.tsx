// pages/student-assignment-dashboard.tsx

import React from "react";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { student_assignments, assignments } from "~/server/db/schema";
import AssignmentTable from "./StudentAssignmentsTable";
import Logo from "~/components/brand/Logo";
import { cn } from "~/lib/utils";
import { APP_NAME } from "~/lib/constants";
import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";

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

export default async function StudentAssignmentDashboard({
  params,
}: {
  params: Params;
}) {
  const { classId, studentId } = params;

  // Fetch data with join
  const rawStudentAssignments = await db
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
    );

  const studentAssignments: StudentAssignmentWithDetails[] =
    rawStudentAssignments.map((assignment) => ({
      ...assignment,
      sa_complete: assignment.sa_complete ?? false,
    }));

  return (
    <div className="p-5 pl-10">
      <header className="mb-8 flex items-center justify-between">
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

      <h1 className="mb-4 text-3xl text-blue-700">
        Your Assignments for Today!
      </h1>

      {/* Assignment Table */}
      <AssignmentTable assignments={studentAssignments} />
    </div>
  );
}
