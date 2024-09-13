import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from "~/server/db/index"
import { assigners } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });

  try {
    const userAssigners = await db
      .select()
      .from(assigners)
      .where(eq(assigners.user_id, userId))
    return NextResponse.json(userAssigners)
  } catch (error) {
    console.error('Error fetching assigners:', error)
    return NextResponse.json({ error: 'Error fetching assigners' }, { status: 500 })
  }
}