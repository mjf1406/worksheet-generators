import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { assigners as assignerTable } from '~/server/db/schema';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  try {
    const type: string | null = req.nextUrl.searchParams.get('type');

    

    if (!type || (type !== "random" && type !== "round-robin" && type !== "seats")) {
      return NextResponse.json({ message: 'Invalid or missing type parameter' }, { status: 400 });
    }

    const data = await db
    .select()
    .from(assignerTable)
    .where(
          and(
              eq(assignerTable.user_id, userId),
              eq(assignerTable.assigner_type, type)
          )
  );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching Assigners:', error);
    return NextResponse.json(
      { message: 'Unable to fetch Assigners due to an internal error.' },
      { status: 500 }
    );
  }
}