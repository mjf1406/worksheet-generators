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
import { shuffleArray } from '~/server/functions';

const assignerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['random', 'round-robin'], { required_error: "Type is required" }),
    items: z.array(z.string()).min(2, "At least 2 items are required"),
    created_date: z.string().optional().nullable(),
    updated_date: z.string().optional().nullable(),
})

export async function createAssigner(input: z.infer<typeof assignerSchema>){
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
        revalidatePath("/assigner/*")
        return userAssigners;
      } catch (error) {
        console.error('Error fetching assigners:', error);
        throw error;
      }
}

export type AssignedItem = {
  item: string | undefined;
  studentNumber: number | null | undefined;
  studentName: string | undefined;
};

export type AssignedData = Record<string, AssignedItem[]>;

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
        const assignersData = await getAssignerById(assignerId)
        const assignerData = assignersData[0]
        const itemsString = assignerData?.items as string
        const items = JSON.parse(itemsString) as string[]
        const name = assignerData?.name
        const groupsWithInsufficientStudents = []

        // Handling Errors
        if (selectedGroups && selectedGroups?.length >= 1 && groupsData) {
          for (const group of groupsData) {
            const students = group.students
            if (students.length > items.length) {
              groupsWithInsufficientStudents.push({
                name: group.group_name,
                studentsCount: students.length,
              })
            }
          }
        }
        if (selectedGroups?.length === 0 && students && items.length < students?.length) { 
          return { 
            success: false, 
            message: `There are only ${items.length} items in the ${name} assigner, yet there are ${students.length} students. Should one or more groups be selected?`
          }
        } else if (selectedGroups && selectedGroups?.length >= 1 && groupsWithInsufficientStudents.length >= 1) {
          const groupNames = groupsWithInsufficientStudents.map(group => group.name)
          return { 
            success: false, 
            message: `There are only ${items.length} items in the ${name} assigner, yet there ${groupsWithInsufficientStudents.length > 1 ? "are" : "is"} ${groupsWithInsufficientStudents.length} group(s) (${groupNames.join(", ")}) with more than ${items.length} students. Should other groups be selected instead of the currently selected group(s)?`
          }
        }
        
        // The Algorithm
        let assignedData
        if (selectedGroups?.length === 0) { // If no groups are selected
          assignedData = {} as AssignedData
          const studentsShuffled = shuffleArray(students!)
          const className = classData?.class_name
          if (className && !assignedData[className]) assignedData[className] = [];
          for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (className && assignedData[className]) assignedData[className].push({
              item: element,
              studentNumber: studentsShuffled[index]?.student_number,
              studentName: studentsShuffled[index]?.student_name_en
            })
          }
        }
        else { // If groups are selected
          assignedData = {} as AssignedData;
          for (const group of groupsData!) {
            const groupName = group.group_name;
            if (!assignedData[groupName]) assignedData[groupName] = [];
            const studentsShuffled = shuffleArray(group.students)
            for (let index = 0; index < items.length; index++) {
              const element = items[index];
              assignedData[groupName].push({
                item: element,
                studentNumber: studentsShuffled[index]?.student_number,
                studentName: studentsShuffled[index]?.student_name_en
              })
            }
          }  
        }
        return { success: true, data: {assignedData, name} }
    } catch (error) {
        console.error('Failed run Assigner:', error)
        return { success: false, message: 'Failed to run Assigner' }
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

type StudentId = string;
type ItemAssignments = Record<string, StudentId[]>;
type AssignerData = Record<string, ItemAssignments>;
type ClassData = Record<string, AssignerData>;
export type DataModel = Record<string, ClassData>;

// absent-student helper, announcer, assistant teacher, attendance reminder, bathroom monitor, birthday monitor, brain break chooser, caboose, line leader, calendar helper, chair stacker, clerk, cubby checker, door manager
export async function runRoundRobinAssigner(
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
    const assignersData = await getAssignerById(assignerId)
    const assignerData = assignersData[0]
    const itemsString = assignerData?.items as string
    const items = JSON.parse(itemsString) as string[]
    const name = assignerData?.name
    const groupsWithInsufficientStudents = []

    // Handling Errors
    if (selectedGroups && selectedGroups?.length >= 1 && groupsData) {
      for (const group of groupsData) {
        const students = group.students
        if (students.length < items.length) {
          groupsWithInsufficientStudents.push({
            name: group.group_name,
            studentsCount: students.length,
          })
        }
      }
    }
    if (selectedGroups?.length === 0 && students && items.length > students?.length) { 
      return { 
        success: false, 
        message: `There are only ${items.length} items in the ${name} assigner, yet there are ${students.length} students. Should one or more groups be selected?`
      }
    } else if (selectedGroups && selectedGroups?.length >= 1 && groupsWithInsufficientStudents.length >= 1) {
      const groupNames = groupsWithInsufficientStudents.map(group => group.name)
      return { 
        success: false, 
        message: `There are ${items.length} items in the ${name} assigner,\n` + 
          `yet there ${groupsWithInsufficientStudents.length > 1 ? "are" : "is"} ${groupsWithInsufficientStudents.length} group(s)\n` + 
          `(${groupNames.join(", ")}) with fewer than ${items.length} students.\n` + 
          `This means that not all items will have a student assigned.\n` +
          `Should (an)other group(s) be selected instead of the currently selected group(s)?`
      }
    }

    // Getting the data we need
    let studentItemStatus: DataModel = assignerData?.student_item_status as DataModel
    if (!studentItemStatus) {
      studentItemStatus = initializeStudentItemStatus({}, classId, assignerId, items);
    }
    const classStatus: ClassData = studentItemStatus[classId] as ClassData ?? {}
    const assignerStatus: ItemAssignments = classStatus[assignerId] as ItemAssignments ?? {}

    // Helper function to get unassigned students
    const getUnassignedStudents = (studentsPool: StudentId[]) => {
      const assignedStudents = new Set(Object.values(assignerStatus).flat());
      return studentsPool.filter(student => !assignedStudents.has(student.student_id));
    };

    // Helper function to get available students for an item
    const getAvailableStudents = (studentsPool: StudentId[], item: string, currentAssignments: Set<string>) => {
      const unassigned = getUnassignedStudents(studentsPool);
      if (unassigned.length > 0) {
        return unassigned.filter(student => !currentAssignments.has(student.student_id));
      }
      return studentsPool.filter(student => 
        (!assignerStatus[item] || !assignerStatus[item].includes(student.student_id)) &&
        !currentAssignments.has(student.student_id)
      );
    };

    // The Algorithm
    const assignedData: AssignedData = {}
    if (selectedGroups?.length === 0) { // If no groups are selected
      const className = classData?.class_name
      if (className) assignedData[className] = [];
      
      let availableStudents: StudentId[] = [...students!];
      const currentAssignments = new Set<string>();

      for (const item of items) {
        if (availableStudents.length === 0) {
          availableStudents = getUnassignedStudents(students!);
          if (availableStudents.length === 0) {
            availableStudents = [...students!].filter(student => !currentAssignments.has(student.student_id));
            if (availableStudents.length === 0) {
              // All students have been assigned in this run, start over
              availableStudents = [...students!];
              currentAssignments.clear();
            }
          }
        }
        
        let validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
        if (validStudents.length === 0) {
          // Reset only this item if no valid students
          assignerStatus[item] = [];
          validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
        }

        const chosenStudent = validStudents[Math.floor(Math.random() * validStudents.length)];
        
        if (className && assignedData[className]) {
          assignedData[className].push({
            item: item,
            studentNumber: chosenStudent.student_number,
            studentName: chosenStudent.student_name_en
          });
        }
        
        if (!assignerStatus[item]) assignerStatus[item] = [];
        assignerStatus[item].push(chosenStudent.student_id);
        currentAssignments.add(chosenStudent.student_id);
        
        availableStudents = availableStudents.filter(student => student.student_id !== chosenStudent.student_id);
      }
    }
    else { // If groups are selected
      for (const group of groupsData!) {
        const groupName = group.group_name;
        if (!assignedData[groupName]) assignedData[groupName] = [];
        
        let availableStudents = [...group.students];
        const currentAssignments = new Set<string>();

        for (const item of items) {
          if (availableStudents.length === 0) {
            availableStudents = getUnassignedStudents(group.students);
            if (availableStudents.length === 0) {
              availableStudents = [...group.students].filter(student => !currentAssignments.has(student.student_id));
              if (availableStudents.length === 0) {
                // All students in the group have been assigned in this run, start over
                availableStudents = [...group.students];
                currentAssignments.clear();
              }
            }
          }
          
          let validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
          if (validStudents.length === 0) {
            // Reset only this item if no valid students
            assignerStatus[item] = [];
            validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
          }

          const chosenStudent = validStudents[Math.floor(Math.random() * validStudents.length)];
          
          assignedData[groupName].push({
            item: item,
            studentNumber: chosenStudent.student_number,
            studentName: chosenStudent.student_name_en
          });
          
          if (!assignerStatus[item]) assignerStatus[item] = [];
          assignerStatus[item].push(chosenStudent.student_id);
          currentAssignments.add(chosenStudent.student_id);
          
          availableStudents = availableStudents.filter(student => student.student_id !== chosenStudent.student_id);
        }
      }
    }

    studentItemStatus[classId][assignerId] = assignerStatus;
    await db
      .update(assignerTable)
      .set({
        student_item_status: studentItemStatus
      })
      .where(eq(assignerTable.assigner_id, assignerId))
    
    return { success: true, data: {assignedData, name} }
  } catch (error) {
    console.error('Failed to run Assigner:', error)
    return { success: false, message: 'Failed to run Assigner' }
  }
}

function initializeStudentItemStatus(
  studentItemStatus: DataModel,
  classId: string,
  assignerId: string,
  items: string[]
): DataModel {
  if (!studentItemStatus[classId]) {
    studentItemStatus[classId] = {};
  }
  
  if (!studentItemStatus[classId][assignerId]) {
    studentItemStatus[classId][assignerId] = {};
  }
  
  const classData = studentItemStatus[classId];
  if (classData) {
    const assignerData = classData[assignerId];
    if (assignerData) {
      items.forEach(item => {
        if (!assignerData[item]) {
          assignerData[item] = [];
        }
      });
    }
  }

  return studentItemStatus;
}