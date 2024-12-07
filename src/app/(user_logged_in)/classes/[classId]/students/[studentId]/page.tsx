import { eq } from "drizzle-orm";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { Button } from "~/components/ui/button";
import { APP_NAME } from "~/lib/constants";
import { db } from "~/server/db";
import { classes, students } from "~/server/db/schema";

interface Params {
  classId: string;
  studentId: string;
}

export default async function studentDashboard({ params }: { params: Params }) {
  const { classId, studentId } = params;

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
    return <div className="p-5 pl-10">Student not found.</div>;
  }

  // Optionally, validate classData if you intend to use it
  if (classData.length === 0) {
    return <div className="p-5 pl-10">Class not found.</div>;
  }

  // Extract the first (and only) student from the array
  const student = studentData[0];

  return (
    <main className="p-5 pl-10">
      <header className="flex gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Logo fill="hsl(var(--primary))" size="25" />
          <h1 className="text-lg font-bold">{APP_NAME}</h1>
          <span className="ml-1 justify-start self-start text-xs">[ALPHA]</span>
        </Link>
      </header>

      <section>
        <h1 className="mb-4 text-3xl text-blue-700">
          Hey there, {student?.student_name_en.split(" ")[1]}!
        </h1>
        <Button asChild>
          <Link href={`/classes/${classId}/students/${studentId}/assignments`}>
            Assignments
          </Link>
        </Button>
      </section>
    </main>
  );
}
