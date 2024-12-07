// pages/studentDashboard.tsx

import { eq } from "drizzle-orm";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import { APP_NAME } from "~/lib/constants";
import { db } from "~/server/db";
import { classes, students } from "~/server/db/schema";

interface Params {
  classId: string;
  studentId: string;
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
  const [classData, studentData] = await Promise.all([
    db.select().from(classes).where(eq(classes.class_id, classId)).limit(1),
    db
      .select()
      .from(students)
      .where(eq(students.student_id, studentId))
      .limit(1),
  ]);

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
    <main className="min-h-screen bg-yellow-50 p-5 pl-10 font-serif dark:bg-gray-900">
      {/* Header Section */}
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

      {/* Welcome Section */}
      <section className="mb-8 rounded-md border-l-4 border-orange-500 bg-pink-100 p-6 shadow-lg dark:bg-pink-800">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
          Hey there, {getFirstName(student!.student_name_en)}!
        </h1>
        <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
          Welcome to your dashboard. Let&apos;s get started with your
          assignments!
        </p>
      </section>

      {/* Assignments Button */}
      <div className="flex justify-center">
        <Button
          asChild
          className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          <Link href={`/classes/${classId}/students/${studentId}/assignments`}>
            View Assignments
          </Link>
        </Button>
      </div>
    </main>
  );
}
