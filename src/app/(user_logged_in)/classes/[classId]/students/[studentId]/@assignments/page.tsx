// app/[classId]/[studentId]/@assignments/page.tsx
import { db } from "~/server/db";
import { assignments, student_assignments } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import AssignmentTable from "../components/StudentAssignmentsTable";

export const dynamic = "force-dynamic"; // if needed

export default async function AssignmentsPage({
  params,
}: {
  params: { classId: string; studentId: string };
}) {
  const { classId, studentId } = params;

  const rawStudentAssignments = await db
    .select({
      sa_id: student_assignments.id,
      sa_user_id: student_assignments.user_id,
      sa_class_id: student_assignments.class_id,
      sa_student_id: student_assignments.student_id,
      sa_assignment_id: student_assignments.assignment_id,
      sa_complete: student_assignments.complete,
      sa_completed_ts: student_assignments.completed_ts,
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

  const studentAssignments = rawStudentAssignments.map((assignment) => ({
    ...assignment,
    sa_complete: assignment.sa_complete ?? false,
  }));

  return (
    <div className="md:col-span-1">
      <AssignmentTable assignments={studentAssignments} />
    </div>
  );
}
