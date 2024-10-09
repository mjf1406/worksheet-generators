import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from "~/server/db/index"
import { reward_items } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });

  try {
    const userRewardItems = await db
      .select()
      .from(reward_items)
      .where(eq(reward_items.user_id, userId))
    return NextResponse.json(userRewardItems)
  } catch (error) {
    console.error('Error fetching reward_items:', error)
    return NextResponse.json({ error: 'Error fetching reward_items' }, { status: 500 })
  }
}