"use server"

import { db } from '~/server/db'
import { assigners as assignerTable } from '~/server/db/schema'
import { eq } from 'drizzle-orm';
import type { AssignerItemStatuses } from '~/server/db/types';

export async function updateAssigner(assignerId: string, studentItemStatus: AssignerItemStatuses){

  await db
    .update(assignerTable)
    .set({
      student_item_status: studentItemStatus
    })
    .where(eq(assignerTable.assigner_id, assignerId));
}