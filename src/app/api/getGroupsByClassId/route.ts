import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db/index';
import { groups, student_groups, students } from '~/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    // throw new Error(`Class ID is ${classId}`)
    console.error(`Class ID is ${classId}`)
    return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
  }

  try {
    // Fetch all groups for the given class
    const groupsForClass = await db.select().from(groups).where(eq(groups.class_id, classId));

    // Fetch all student_groups entries for these groups
    const groupIds = groupsForClass.map(group => group.group_id);
    const studentGroupEntries = await db.select().from(student_groups).where(inArray(student_groups.group_id, groupIds));

    // Fetch all students associated with these groups
    const studentIds = studentGroupEntries.map(entry => entry.student_id);
    const studentsInGroups = await db.select().from(students).where(inArray(students.student_id, studentIds));

    // Create a map of group_id to students
    const groupStudentsMap = studentGroupEntries.reduce((acc, entry) => {
      if (!acc[entry.group_id]) {
        acc[entry.group_id] = [];
      }
      acc[entry.group_id]?.push(entry.student_id);
      return acc;
    }, {} as Record<string, string[]>);

    // Create the final result
    const groupsWithStudents = groupsForClass.map(group => ({
      ...group,
      students: studentsInGroups.filter(student => 
        groupStudentsMap[group.group_id]?.includes(student.student_id)
      )
    }));

    return NextResponse.json(groupsWithStudents);
  } catch (error) {
    console.error('Failed to fetch groups with students:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}