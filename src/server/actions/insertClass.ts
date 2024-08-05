"use server"

import { db } from "~/server/db/index";
import { 
    classes as classesTable, 
    teacher_classes as teacherClassesTable,
    students as studentsTable, 
    student_classes as studentClassesTable,
} from "~/server/db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export type ClassGrade = "1" | "2" | "3" | "4" | "5";
export type Role = "primary" | "assistant"
export type UserRole = "teacher" | "admin"

export type Student = {
    student_id: string;
    student_name_en: string;
    student_name_alt: string | undefined;
    student_grade: string | undefined;
    student_reading_level: string | undefined;
    student_sex: "male" | "female" | null;
    student_number: number | null;
    student_email: string | null;
    joined_date?: string;
    updated_date?: string;
}

type ClassData = {
    class_id: string;
    class_name: string;
    class_language: string;
    class_grade: ClassGrade;
    class_year: string | undefined;
    complete: {
        s1: boolean,
        s2: boolean
    };
}

export type Data = {
    class_id: string | undefined;
    class_name: string;
    class_language: string;
    class_grade: ClassGrade;
    class_year: string | undefined;
    role: Role;
    fileContents: string;
}

type TeacherClassData = {
    assignment_id: string;
    user_id: string;
    class_id: string;
    role: Role;
}

export type StudentId = {
    sid: string,
    fid: string
}

export type CSVStudent = Record<string, string | undefined>;

function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}

function csvToJson(csvString: string): CSVStudent[] {
    const lines = csvString.split('\n');
    const result: CSVStudent[] = [];
    const headers = lines[0]?.split(',') ?? [];
  
    for (let i = 1; i < lines.length; i++) {
      const obj: CSVStudent = {};
      const currentline = lines[i]?.split(',') ?? [];
  
      if (headers.length > 0 && currentline && currentline.length === headers.length) {
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j]?.trim();
            if (header === undefined) continue
            obj[header] = currentline[j]?.trim() ?? '';
        }
        result.push(obj);
      }
    }
    return result;
  }

export default async function insertClass(data: Data, userId: string, complete: boolean | undefined | null) {

    if (data.class_language === null || data.class_language === undefined || data.class_language === '') data.class_language = 'en-US'

    const classId = generateUuidWithPrefix('class_')
    const classData: ClassData = {
        class_id: classId,
        class_name: data.class_name,
        class_language: data.class_language,
        class_grade: data.class_grade,
        class_year: data.class_year,
        complete: (complete) ? { s1: true, s2: true } : { s1: false, s2: false }
    }
    await db.insert(classesTable).values(classData)

    const assignmentId = generateUuidWithPrefix('assignment_')
    const teacherClassData: TeacherClassData = {
        assignment_id: assignmentId,
        user_id: userId,
        class_id: classId,
        role: data.role,
    }
    await db.insert(teacherClassesTable).values(teacherClassData)

    let studentsJson = csvToJson(data.fileContents)
    studentsJson = studentsJson.filter(
        (i) => i.name_en != "" && i.name_alt != "" && i.grade != "",
    );
    console.log("🚀 ~ insertClass ~ studentsJson:", studentsJson)
    const studentsData: Student[] = [];
    const studentFieldData = []
    const studentClassesData = []
    const studentIds: object[] = []
    
    for (const student of studentsJson) {
        if (!student.name_en) {
            console.warn(`Skipping student due to missing required field: ${JSON.stringify(student)}`);
            continue
        }
        
        const fieldId = generateUuidWithPrefix('field_')
        const studentId = generateUuidWithPrefix('student_')
        const enrollmentId = generateUuidWithPrefix('enrollment_')

        studentIds.push({
            sid: studentId,
            fid: fieldId,
        })

        const stud: Student = {
            student_id: studentId,
            student_name_en: student.name_en,
            student_name_alt: student.name_alt,
            student_grade: student.grade,
            student_reading_level: student.reading_level,
            student_sex: (student.sex === "male" || student.sex === "female") ? student.sex : null,
            student_number: student.number ? parseInt(student.number, 10) : null,
            student_email: student.email ?? null,
        };
        studentsData.push(stud)

        const studf = {
            field_id: fieldId,
            student_id: studentId,
        }
        studentFieldData.push(studf)

        const studc = {
            enrollment_id: enrollmentId,
            student_id: studentId,
            class_id: classId
        }
        studentClassesData.push(studc)
    }
    await db.insert(studentsTable).values(studentsData)
    await db.insert(studentClassesTable).values(studentClassesData)
    revalidatePath("/classes");
    return JSON.stringify(studentIds)
}