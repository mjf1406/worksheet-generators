import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import type { Assigner, AssignerItemStatuses, AssignerItemStatusesAssigner, TeacherCourse } from "~/server/db/types";
import { updateAssigner } from "./actions";
import type { AssignerResult } from "./RoundRobinClient";
import type { AssignedData, AssignmentItem } from "../components/PDF";

export async function roundRobinAssigner(
    classData: TeacherCourse, 
    assignerData: Assigner, 
    selectedGroups: string[]
): Promise<AssignerResult> {
    try {
        const classId = classData.class_id;
        const className = classData.class_name;
        const assignerId = assignerData.assigner_id;
        const assignerName = assignerData.name;
        const items: string[] = JSON.parse(assignerData.items) as string[];
        const itemCounts = countElementsInArray(items);
        const uniqueItems = removeDuplicates(items);
        const students: StudentData[] = classData.students ?? [];
        if (students.length === 0) return {success: false, message: "No students in data"};

        let itemStatus: AssignerItemStatuses | null = assignerData.student_item_status;
        if (!itemStatus) itemStatus = createStudentItemStatusStructure(classId, assignerId, uniqueItems, students);
        const assignedStudents: AssignedData = { 
            name: assignerName, 
            assignedData: {} as Record<string, AssignmentItem[]>
        };
        
        if (!itemStatus[classId]) itemStatus = createStudentItemStatusClassStructure(classId, assignerId, uniqueItems, students, itemStatus)
        const assignersItemStatus = itemStatus[classId];
        if (!assignersItemStatus) return { success: false, message: "No student item statuses for this class in the assigner data"};

        const studentItemStatus: AssignerItemStatusesAssigner | undefined = assignersItemStatus[assignerId] as unknown as AssignerItemStatusesAssigner;
        if (!studentItemStatus) return { success: false, message: "No student item statuses in this class for this assigner"};

        if (selectedGroups && selectedGroups.length > 0) {
            for (const group of selectedGroups) {
                const groupData = classData.groups?.find(i => i.group_id === group);
                const groupName = groupData?.group_name;
                const groupStudents: StudentData[] | undefined = groupData?.students;
                if (groupName) assignedStudents.assignedData[groupName] = [];
                if (!groupStudents) throw new Error("Something is wrong with the groups, please double check yours, then try again.");
                if (itemStatus) {
                    const result = assignItems(uniqueItems, itemStatus, studentItemStatus, itemCounts, groupStudents, classId, assignerId);
                    if (result) {
                        itemStatus = result.itemStatus;
                        if (groupName && assignedStudents.assignedData[groupName]) {
                            assignedStudents.assignedData[groupName].push(...result.assignedData);
                        }
                    }
                }
            }
        } else if (itemStatus) {
            const result = assignItems(uniqueItems, itemStatus, studentItemStatus, itemCounts, students, classId, assignerId);
            if (className) assignedStudents.assignedData[className] = [];
            if (result) {
                itemStatus = result.itemStatus;
                if (className && assignedStudents.assignedData[className]) {
                    assignedStudents.assignedData[className].push(...result.assignedData);
                }
            }
        }
        
        if (itemStatus && assignedStudents) {
            // console.log("🚀 ~ itemStatus:", itemStatus)
            // console.log("🚀 ~ assignedStudents:", assignedStudents);
            await updateAssigner(assignerId, itemStatus);
            return { success: true, data: assignedStudents };
        }
        throw new Error("Something went wrong. Please try again.");
        
    } catch (err) {
        console.error("Failed to assign round-robin items:", err);
        return {success: false, message: "Failed to run the round-robin assigner."};
    }
}

function assignItems(
    uniqueItems: string[], 
    itemStatus: AssignerItemStatuses, 
    studentItemStatus: AssignerItemStatusesAssigner, 
    itemCounts: Record<string, number>, 
    students: StudentData[],
    classId: string,
    assignerId: string
): { itemStatus: AssignerItemStatuses; assignedData: AssignmentItem[] } | null {
    const studentsWithJobs: StudentData[] = [];
    const assignedData: AssignmentItem[] = [];
    const totalJobsPerStudent = countTotalJobsPerStudent(studentItemStatus);

    for (const item of uniqueItems) {
        const studentsSortedByValue = sortStudentsByValueWithShuffle(studentItemStatus, item, totalJobsPerStudent);
        if (!studentsSortedByValue) continue;
        const studentDataSortedByValue = applyOrderToStudentData(studentsSortedByValue, students);
        
        const itemCount = itemCounts[item];
        if (!itemCount) continue;
        
        const randomStudents = getRandomStudents(itemCount, studentDataSortedByValue, studentsWithJobs);
        if (!randomStudents) return null;

        studentsWithJobs.push(...randomStudents);

        const studentsToAdd = randomStudents.map(chosenStudent => ({
            item: item,
            studentNumber: chosenStudent.student_number,
            studentName: chosenStudent.student_name_first_en,
            studentSex: chosenStudent.student_sex,
        }));
          
        assignedData.push(...studentsToAdd);
                
        for (const student of randomStudents) {
            const studentId = student.student_id;
            if (itemStatus[classId]?.[assignerId]?.[item]) {
                if (itemStatus[classId][assignerId][item][studentId] === undefined) {
                    itemStatus[classId][assignerId][item][studentId] = 0;
                }
                itemStatus[classId][assignerId][item][studentId] += 1;
                totalJobsPerStudent[studentId] = (totalJobsPerStudent[studentId] ?? 0) + 1;
            }
        }
    }
    return { itemStatus, assignedData };
}

function getRandomStudents(
    itemCount: number, 
    studentData: StudentData[], 
    studentsWithJobs: StudentData[]
): StudentData[] | null {
    if (itemCount === 2) {
        const females = studentData.filter(i => i.student_sex === "female")
        const males = studentData.filter(i => i.student_sex === "male")

        let randomFemale: StudentData | undefined
        let randomMale: StudentData | undefined

        for (const female of females) {
            if (!studentsWithJobs.find(i => i.student_id === female.student_id)) {
                randomFemale = female
                break
            }
        }

        for (const male of males) {
            if (!studentsWithJobs.find(i => i.student_id === male.student_id)) {
                randomMale = male
                break
            }
        }

        if (randomFemale && randomMale) return [randomFemale, randomMale]

        return null

    } else if (itemCount === 1) {
        for (const student of studentData) {
            if (!studentsWithJobs.find(i => i.student_id === student.student_id)) {
                return [student]
            }
        }
    }
    return null
}

function applyOrderToStudentData(
    sortedStudentIdsWithValues: [string, number][],
    studentData: StudentData[]
): StudentData[] {
    const studentMap = new Map(studentData.map(student => [student.student_id, student]));

    return sortedStudentIdsWithValues
        .map(([id]) => studentMap.get(id))
        .filter((student): student is StudentData => student !== undefined);
}

function countTotalJobsPerStudent(studentItemStatus: AssignerItemStatusesAssigner): Record<string, number> {
    const totalJobs: Record<string, number> = {};
    
    for (const item in studentItemStatus) {
        const itemStatus = studentItemStatus[item];
        if (itemStatus) {
            for (const studentId in itemStatus) {
                if (totalJobs[studentId] === undefined) {
                    totalJobs[studentId] = 0;
                }
                const jobCount = itemStatus[studentId];
                if (typeof jobCount === 'number') {
                    totalJobs[studentId] += jobCount;
                }
            }
        }
    }
    
    return totalJobs;
}

function sortStudentsByValueWithShuffle(
    classData: AssignerItemStatusesAssigner,
    targetItem: string,
    totalJobsPerStudent: Record<string, number>
): [string, number][] | null {
    if (!(targetItem in classData)) {
        return [];
    }

    const students = classData[targetItem];

    if (!students) return null;

    const studentArray = Object.entries(students);

    studentArray.sort((a, b) => {
        const [studentIdA, valueA] = a;
        const [studentIdB, valueB] = b;
        
        const totalJobsA = totalJobsPerStudent[studentIdA] ?? 0;  
        const totalJobsB = totalJobsPerStudent[studentIdB] ?? 0;
        const totalJobsDiff = totalJobsA - totalJobsB;
        if (totalJobsDiff !== 0) {
            return totalJobsDiff;
        }
        
        if (valueA !== valueB) {
            return Number(valueA) - Number(valueB);
        }
        
        return Math.random() - 0.5;
    });

    return studentArray.map(([key, value]) => [key, Number(value)]) ?? null;
}

export function createStudentItemStatusStructure(
    classId: string,
    assignerId: string,
    items: string[],
    studentData: StudentData[]
): AssignerItemStatuses {
    const result: AssignerItemStatuses = {};

    if (!result[classId]) {
        result[classId] = {};
    }

    if (!result[classId][assignerId]) {
        result[classId][assignerId] = {};
    }

    for (const item of items) {
        if (!result[classId][assignerId][item]) {
            result[classId][assignerId][item] = {};
        }

        for (const student of studentData) {
            const studentId = student.student_id;
            if (result[classId]?.[assignerId]?.[item]) {
                result[classId][assignerId][item][studentId] = 0;
            }
        }
    }

    return result;
}

export function createStudentItemStatusClassStructure(
    classId: string,
    assignerId: string,
    items: string[],
    studentData: StudentData[],
    studentItemStatus: AssignerItemStatuses
): AssignerItemStatuses {
    if (!studentItemStatus[classId]) {
        studentItemStatus[classId] = {};
    }

    if (!studentItemStatus[classId][assignerId]) {
        studentItemStatus[classId][assignerId] = {};
    }

    for (const item of items) {
        if (!studentItemStatus[classId][assignerId][item]) {
            studentItemStatus[classId][assignerId][item] = {};
        }

        for (const student of studentData) {
            const studentId = student.student_id;
            if (studentItemStatus[classId]?.[assignerId]?.[item]) {
                studentItemStatus[classId][assignerId][item][studentId] = 0;
            }
        }
    }

    return studentItemStatus;
}

function countElementsInArray(arr: string[]): Record<string, number> {
    return arr.reduce((acc, item) => {
        acc[item] = (acc[item] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

function removeDuplicates<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

// Line Leader, Line Leader, Teacher's Assistant, Teacher's Assistant, Chromebook Captain, Chromebook Captain, Attendance Monitor
// 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240
// 1,2,3,4,5,6,7,8,9,10,11,12,13,14