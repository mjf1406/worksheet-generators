import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStudent } from '~/server/actions/getStudentById'
export const dynamic = 'force-dynamic'
// This is the GET handler for the '/api/classes' endpoint
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error('User ID is null');
    }
    const studentId: string | null = req.nextUrl.searchParams.get('studentId');
    const classId: string | null = req.nextUrl.searchParams.get('classId');

    const data = await getStudent(studentId, classId, userId);

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

