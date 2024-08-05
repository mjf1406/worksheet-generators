import { type NextRequest, NextResponse } from 'next/server';
import { getClasses } from '~/server/db/functions/classes'; // Adjust this path to where your database functions are stored
import { auth } from '@clerk/nextjs/server';
import type { TeacherCourse } from "~/server/db/types";

type Data = {
  classes: {
    class_id: string;
    class_name: string;
    class_language: string;
    class_grade: string;
    class_year: string;
    created_date: string;
    updated_date: string;
    complete: {
      s1: boolean;
      s2: boolean;
    };
  };
  teacher_classes: {
    assigned_date: string;
    role: string;
  };
};

async function databaseClassesToCourseMap(
  data: Data[],
): Promise<TeacherCourse[]> {
  const classes: TeacherCourse[] = [];
  for (const element of data) {
    classes.push({
      class_id: element.classes.class_id,
      class_name: element.classes.class_name,
      class_language: element.classes.class_language,
      class_grade: element.classes.class_grade,
      class_year: element.classes.class_year,
      created_date: element.classes.created_date,
      updated_date: element.classes.updated_date,
      assigned_date: element.teacher_classes.assigned_date,
      role: element.teacher_classes.role,
      complete: element.classes.complete,
    });
  }
  return classes;
}

// This is the GET handler for the '/api/classes' endpoint
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error('User ID is null');
    }
    const dataOne: Data[] = await getClasses(userId) as Data[];
    const data = await databaseClassesToCourseMap(dataOne);

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return new NextResponse(JSON.stringify({ message: 'Unable to fetch classes due to an internal error.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

