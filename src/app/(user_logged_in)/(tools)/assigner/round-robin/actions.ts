"use server";

import { db } from '~/server/db'
import { 
    assigners as assignerTable, 
} from '~/server/db/schema'
import { eq } from 'drizzle-orm';
import { getClassById } from '~/server/actions/getClassById';
import { getAssignerById, getGroupsByClassId } from '~/app/(user_logged_in)/(tools)/assigner/random/actions';

export type StudentId = string;
export type ItemAssignments = Record<string, StudentId[]>;
// Changed AssignerData to be the same as ItemAssignments
export type AssignerData = ItemAssignments;
export type ClassData = Record<string, AssignerData>;
export type DataModel = Record<string, ClassData>;

export type AssignedItem = {
  item: string;
  studentNumber: number | null;
  studentName: string;
};

export type AssignedData = Record<string, AssignedItem[]>;

export type ExtendedStudent = {
  updated_date: string;
  student_id: string;
  student_name_en: string;
  student_name_alt: string | null;
  student_reading_level: string | null;
  student_grade: string | null;
  student_sex: "male" | "female" | null;
  student_number: number | null;
  student_email: string | null;
  joined_date: string;
};

type AssignerDataItem = {
  items: string;
  name: string;
  student_item_status: DataModel;
};

export async function runRoundRobinAssigner(
    userId: string | null | undefined,
    classId: string,
    assignerId: string,
    selectedGroups: string[] | undefined
  ) {
    if (!userId) throw new Error("User not authenticated");
    if (!classId) throw new Error("No class selected");
    if (!assignerId) throw new Error("No Assigner selected");
  
    try {
      const classData = selectedGroups?.length === 0 ? await getClassById(classId, userId) : null;
      const students = selectedGroups?.length === 0 ? classData?.students as ExtendedStudent[] | null : null;
      const classGroupsData = selectedGroups && selectedGroups.length !== 0 ? await getGroupsByClassId(classId) : null;
      const groupsData = selectedGroups && selectedGroups.length !== 0 && classGroupsData
        ? classGroupsData.filter(i => selectedGroups.includes(i.group_id))
        : null;
      const assignersData = await getAssignerById(assignerId) as AssignerDataItem[];
      const assignerData = assignersData[0];
      const itemsString = assignerData?.items;
      const items: string[] = itemsString ? JSON.parse(itemsString) as string[] : [];
      const name = assignerData?.name ?? "Unknown Assigner";
      const groupsWithInsufficientStudents: { name: string; studentsCount: number }[] = [];
  
      // Handling Errors
      if (selectedGroups && selectedGroups.length >= 1 && groupsData) {
        for (const group of groupsData) {
          if (group.students.length < items.length) {
            groupsWithInsufficientStudents.push({
              name: group.group_name,
              studentsCount: group.students.length,
            });
          }
        }
      }
      if (selectedGroups?.length === 0 && students && items.length > students.length) {
        return {
          success: false,
          message: `There are only ${items.length} items in the ${name} assigner, yet there are ${students.length} students. Should one or more groups be selected?`
        };
      } else if (selectedGroups && selectedGroups.length >= 1 && groupsWithInsufficientStudents.length >= 1) {
        const groupNames = groupsWithInsufficientStudents.map(group => group.name);
        return {
          success: false,
          message: `There are ${items.length} items in the ${name} assigner,\n` +
            `yet there ${groupsWithInsufficientStudents.length > 1 ? "are" : "is"} ${groupsWithInsufficientStudents.length} group(s)\n` +
            `(${groupNames.join(", ")}) with fewer than ${items.length} students.\n` +
            `This means that not all items will have a student assigned.\n` +
            `Should (an)other group(s) be selected instead of the currently selected group(s)?`
        };
      }
  
      let studentItemStatus: DataModel = assignerData?.student_item_status ?? {};
      studentItemStatus = initializeStudentItemStatus(studentItemStatus, classId, assignerId, items);
      const classStatus: ClassData = studentItemStatus[classId] ?? {};
      const assignerStatus: AssignerData = classStatus[assignerId] ?? {};
  
      // Helper function to get unassigned students
      const getUnassignedStudents = (studentsPool: ExtendedStudent[]): ExtendedStudent[] => {
        const assignedStudents = new Set(Object.values(assignerStatus).flat());
        return studentsPool.filter(student => !assignedStudents.has(student.student_id));
      };
  
      // Helper function to get available students for an item
      const getAvailableStudents = (studentsPool: ExtendedStudent[], item: string, currentAssignments: Set<string>): ExtendedStudent[] => {
        const unassigned = getUnassignedStudents(studentsPool);
        if (unassigned.length > 0) {
          return unassigned.filter(student => !currentAssignments.has(student.student_id));
        }
        return studentsPool.filter(student =>
          (!assignerStatus[item] ?? !assignerStatus[item]?.includes(student.student_id)) &&
          !currentAssignments.has(student.student_id)
        );
      };
  
      // The Algorithm
      const assignedData: AssignedData = {};
      if (selectedGroups?.length === 0 && students) {
        const className = classData?.class_name ?? "Default Class";
        assignedData[className] = [];
  
        let availableStudents: ExtendedStudent[] = [...students];
        const currentAssignments = new Set<string>();
  
        for (const item of items) {
          if (availableStudents.length === 0) {
            availableStudents = getUnassignedStudents(students);
            if (availableStudents.length === 0) {
              availableStudents = students.filter(student => !currentAssignments.has(student.student_id));
              if (availableStudents.length === 0) {
                availableStudents = [...students];
                currentAssignments.clear();
              }
            }
          }
  
          let validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
          if (validStudents.length === 0) {
            assignerStatus[item] = [];
            validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
          }
  
          const chosenStudent = validStudents[Math.floor(Math.random() * validStudents.length)];
  
          if (chosenStudent) {
            assignedData[className].push({
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
      else if (groupsData) {
        for (const group of groupsData) {
          const groupName = group.group_name;
          if (!assignedData[groupName]) assignedData[groupName] = [];
  
          let availableStudents: ExtendedStudent[] = [...group.students];
          const currentAssignments = new Set<string>();
  
          for (const item of items) {
            if (availableStudents.length === 0) {
              availableStudents = getUnassignedStudents(group.students);
              if (availableStudents.length === 0) {
                availableStudents = group.students.filter(student => !currentAssignments.has(student.student_id));
                if (availableStudents.length === 0) {
                  availableStudents = [...group.students];
                  currentAssignments.clear();
                }
              }
            }
  
            let validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
            if (validStudents.length === 0) {
              assignerStatus[item] = [];
              validStudents = getAvailableStudents(availableStudents, item, currentAssignments);
            }
  
            const chosenStudent = validStudents[Math.floor(Math.random() * validStudents.length)];
  
            if (chosenStudent) {
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
      }
  
      if (classId && assignerId) {
        studentItemStatus[classId] = studentItemStatus[classId] ?? {};
        studentItemStatus[classId][assignerId] = assignerStatus;
      }
  
      await db
        .update(assignerTable)
        .set({
          student_item_status: studentItemStatus
        })
        .where(eq(assignerTable.assigner_id, assignerId));
  
      return { success: true, data: { assignedData, name } };
    } catch (error) {
      console.error('Failed to run Assigner:', error);
      return { success: false, message: 'Failed to run Assigner' };
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