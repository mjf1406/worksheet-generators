"use client";

import { useState } from "react";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import type {
  TeacherCourse,
  StudentExpectation,
  Expectation,
} from "~/server/db/types";
import { Button } from "~/components/ui/button";
import EditSingleExpectationDialog from "./EditSingleExpectation";
import { Edit } from "lucide-react";

interface StudentsTableProps {
  courseData: TeacherCourse;
}

interface SelectedStudentExp {
  student: StudentData;
  expectation: Expectation;
  studentExpectation?: StudentExpectation;
}

export default function StudentsExpectationsTable({
  courseData,
}: StudentsTableProps) {
  const [selectedStudentExp, setSelectedStudentExp] =
    useState<SelectedStudentExp | null>(null);

  const expectations = courseData.expectations ?? [];

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">
              Student Name
            </th>
            {expectations.map((exp) => (
              <th key={exp.id} className="border border-gray-300 p-2 text-left">
                {exp.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courseData.students?.map((student) => {
            const studentExps = courseData.student_expectations.filter(
              (se) => se.student_id === student.student_id,
            );

            return (
              <tr key={student.student_id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">
                  {student.student_name_en}
                </td>

                {expectations.map((exp) => {
                  const studentExp = studentExps.find(
                    (se) => se.expectation_id === exp.id,
                  );
                  const displayValue =
                    studentExp?.value ?? studentExp?.number ?? "—";

                  return (
                    <td
                      key={exp.id}
                      className="border border-gray-300 p-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span>{displayValue}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setSelectedStudentExp({
                              student,
                              expectation: exp,
                              studentExpectation: studentExp,
                            })
                          }
                        >
                          <Edit size={18} />
                        </Button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedStudentExp && (
        <EditSingleExpectationDialog
          student={selectedStudentExp.student}
          expectation={selectedStudentExp.expectation}
          studentExpectation={selectedStudentExp.studentExpectation}
          classId={courseData.class_id}
          onClose={() => setSelectedStudentExp(null)}
        />
      )}
    </div>
  );
}
