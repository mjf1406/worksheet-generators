import { type NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
import { getClassById } from '~/server/actions/getClassById';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const classId: string | null = req.nextUrl.searchParams.get('classId');
    const userId: string | null = req.nextUrl.searchParams.get('userId');
    // const { userId } = auth();
    
    if (!userId) {
      throw new Error('User ID is null');
    }

    const data: unknown = await getClassById(classId!, userId);

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


