// page.tsx
import { getRandomConversationStarter } from "~/lib/utils";
import { getFirstName } from "~/lib/utils";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { db } from "~/server/db";
import { students } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default async function StudentPage({
  params,
}: {
  params: { classId: string; studentId: string };
}) {
  const { classId, studentId } = params;

  const studentData = await db
    .select()
    .from(students)
    .where(eq(students.student_id, studentId))
    .limit(1);

  if (studentData.length === 0) {
    return <div className="p-5 pl-10 text-red-500">Student not found.</div>;
  }

  const student = studentData[0];
  const randomConversationStarter = getRandomConversationStarter();

  return (
    <>
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
            <CardTitle>Hey there, {student?.student_name_first_en}!</CardTitle>
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
    </>
  );
}
