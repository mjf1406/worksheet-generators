"use server"

import { db } from "~/server/db/index";
import { 
    student_fields as StudentFieldsTable
} from "~/server/db/schema";
import type { StudentField } from "../db/types";
import { eq } from "drizzle-orm";

export default async function updateStudentField(data: StudentField | StudentField[]) {
    if (Array.isArray(data)) {
        for (const item of data) {
            await db.update(StudentFieldsTable)
                .set(item)
                .where(eq(StudentFieldsTable.field_id, item.field_id))
        }
        // const batchOperations = data.map(item => 
        //     db.update(StudentFieldsTable)
        //       .set(item)
        //       .where(eq(StudentFieldsTable.field_id, item.field_id))
        // );
        // await db.batch(batchOperations); // TODO: get this working...
    } else {
        await db
            .update(StudentFieldsTable)
            .set(data)
            .where(eq(StudentFieldsTable.field_id, data.field_id));
    }
}