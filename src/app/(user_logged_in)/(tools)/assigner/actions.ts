"use server";

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '~/server/db'
import { 
    assigners as assignerTable, 
    groups, 
    student_groups, 
    students 
} from '~/server/db/schema'
import { auth } from '@clerk/nextjs/server';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';
import { and, eq, inArray } from 'drizzle-orm';
import { getClassById } from '~/server/actions/getClassById';
import { Assigner } from '~/server/db/types';

const assignerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['random', 'round-robin'], { required_error: "Type is required" }),
    items: z.array(z.string()).min(2, "At least 2 items are required"),
    created_date: z.string().optional().nullable(),
    updated_date: z.string().optional().nullable(),
})

export async function createAssigner(input: z.infer<typeof assignerSchema>){
    console.log("🚀 ~ createAssigner ~ input:", input)
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated")

    try {
        await db.insert(assignerTable).values({
            assigner_id: generateUuidWithPrefix("assigner_"),
            user_id: userId,
            name: input.name,
            items: JSON.stringify(input.items),
            assigner_type: input.type
        })
        revalidatePath(`/assigner`)
        return { success: true, message: 'Students added successfully' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Zod validation error:', error.errors);
            return { success: false, message: 'Invalid input', errors: error.errors }
        }
        console.error('Failed to add Assigner:', error)
        return { success: false, message: 'Failed to create Assigner' }
    }
}

export async function getAssignersByUserId(userId: string, type: "random" | "round-robin") {
    try {
        const userAssigners = await db
          .select()
          .from(assignerTable)
          .where(
                and(
                    eq(assignerTable.user_id, userId),
                    eq(assignerTable.assigner_type, type)
                )
        );
        return userAssigners;
      } catch (error) {
        console.error('Error fetching assigners:', error);
        throw error;
      }
}

export async function runRandomAssigner(
    userId: string | null | undefined, 
    classId: string, 
    assignerId: string, 
    selectedGroups: string[] | undefined
) {
    if (!userId) throw new Error("User not authenticated")
    if (!classId) throw new Error("No class selected")
    if (!assignerId) throw new Error("No Assigner selected")

    try {
        const classData = selectedGroups?.length === 0 ? await getClassById(classId, userId) : null
        const students = selectedGroups?.length === 0 ? classData?.students : null
        const classGroupsData = selectedGroups?.length === 0 ? null : await getGroupsByClassId(classId)
        const groupsData = selectedGroups?.length === 0 ? null : classGroupsData?.filter(i => selectedGroups?.includes(i.group_id))
        const assignersData: Assigner[] = await getAssignerById(assignerId) as Assigner[]
        const assignerData = assignersData[0]
        const items = JSON.parse(assignerData?.items)
        const name = assignerData?.nam
        if (selectedGroups?.length === 0) {
            for (const student of students!) {
                
            }
        }
        else {
            for (const group of groupsData!) {
                for (const student of group.students) {
                    
                }
            }
        }
        
    } catch (error) {
        console.error('Failed run Assigner:', error)
        return { success: false, message: 'Failed run Assigner' }
    }
}
// 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213
async function getAssignerById(assignerId: string) {
    if (!assignerId) throw new Error("Assigner ID is undefined")
    try {
        const userAssigners = await db
          .select()
          .from(assignerTable)
          .where(eq(assignerTable.assigner_id, assignerId));
        return userAssigners
      } catch (error) {
        console.error('Error fetching assigner:', error);
        throw error;
      }
}
async function getGroupsByClassId(classId: string) {
    if (!classId) {
        console.error(`Class ID is ${classId}`)
        throw new Error("Class ID is undefined")
      }
    
      try {
        // Fetch all groups for the given class
        const groupsForClass = await db.select().from(groups).where(eq(groups.class_id, classId));
    
        // Fetch all student_groups entries for these groups
        const groupIds = groupsForClass.map(group => group.group_id);
        const studentGroupEntries = await db.select().from(student_groups).where(inArray(student_groups.group_id, groupIds));
    
        // Fetch all students associated with these groups
        const studentIds = studentGroupEntries.map(entry => entry.student_id);
        const studentsInGroups = await db.select().from(students).where(inArray(students.student_id, studentIds));
    
        // Create a map of group_id to students
        const groupStudentsMap = studentGroupEntries.reduce((acc, entry) => {
          if (!acc[entry.group_id]) {
            acc[entry.group_id] = [];
          }
          acc[entry.group_id]?.push(entry.student_id);
          return acc;
        }, {} as Record<string, string[]>);
    
        // Create the final result
        const groupsWithStudents = groupsForClass.map(group => ({
          ...group,
          students: studentsInGroups.filter(student => 
            groupStudentsMap[group.group_id]?.includes(student.student_id)
          )
        }));
    
        return groupsWithStudents
      } catch (error) {
        console.error('Failed to fetch groups with students:', error);
        throw new Error("Failed to fetch groups with students")
      }
}