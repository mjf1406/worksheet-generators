import { type NextRequest, NextResponse } from 'next/server';
import { downloadReportsBySemester } from '~/server/actions/downloadReportsBySemester';

export async function GET(req: NextRequest) {
  try {
    const userId: string | null = req.nextUrl.searchParams.get('userId');
    if (!userId) throw new Error('User ID is null');

    const classId: string | null = req.nextUrl.searchParams.get('classId');
    const semester: string | null = req.nextUrl.searchParams.get('semester');
    if (!classId || !semester) throw new Error("api: missing class id and/or semester")

    const data = await downloadReportsBySemester(classId, semester);

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

