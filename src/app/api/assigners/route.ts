import { type NextRequest, NextResponse } from 'next/server';
import { getAssignersByUserId } from '~/app/(user_logged_in)/(tools)/assigner/actions';
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId: string | null = req.nextUrl.searchParams.get('userId');
    const type: string | null = req.nextUrl.searchParams.get('type');
    console.log("🚀 ~ GET ~ type:", type)
    if (!userId) throw new Error('User not authenticated');
    if (!type || type != "random" && type != "round-robin") throw new Error('Type is undefined');

    const data: unknown = await getAssignersByUserId(userId, type);

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching Assigners:', error);
    return new NextResponse(JSON.stringify(
      { message: 'Unable to fetch Assigners due to an internal error.' }
    ), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


