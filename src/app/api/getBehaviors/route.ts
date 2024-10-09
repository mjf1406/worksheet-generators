import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from "~/server/db/index"
import { behaviors } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });

  try {
    const userBehaviors = await db
      .select()
      .from(behaviors)
      .where(eq(behaviors.user_id, userId))
    return NextResponse.json(userBehaviors)
  } catch (error) {
    console.error('Error fetching behaviors:', error)
    return NextResponse.json({ error: 'Error fetching behaviors' }, { status: 500 })
  }
}