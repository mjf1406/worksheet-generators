// components/AssignmentTable.tsx

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "~/components/ui/table"; // Ensure this path is correct
import { RefreshCcw, RotateCw } from "lucide-react";
import { ModeToggle } from "~/components/theme/theme-toggle";

interface Assignment {
  sa_id: string;
  sa_user_id: string;
  sa_class_id: string;
  sa_student_id: string;
  sa_assignment_id: string;
  sa_complete: boolean;
  sa_completed_ts: string | null;
  assignment_name: string;
  assignment_description: string | null;
  assignment_data: string | null;
  due_date: string | null;
  topic: string | null;
  working_date: string | null;
  created_date: string;
  updated_date: string;
}

interface AssignmentTableProps {
  assignments: Assignment[];
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({ assignments }) => {
  return (
    <div className="m-5 font-serif">
      {/* Introduction for the students */}
      <div className="mb-6 rounded-md border-l-4 border-orange-500 bg-yellow-100 p-4 text-lg dark:bg-gray-800 dark:text-gray-200">
        <p>Here are your assignments for today! Follow these steps:</p>
      </div>

      {/* Instructional Steps */}
      <ol className="mb-8 space-y-4">
        <InstructionStep
          number={1}
          text="Read the description to make sure you know what the assignment is."
        />
        <InstructionStep
          number={2}
          text="Complete the assignments in order from top to bottom."
        />
        <InstructionStep
          number={3}
          text="If you have questions, ask your desk partner and teammates before you ask your teacher."
        />
        <InstructionStep
          number={4}
          text="When you finish an assignment, bring it to your teacher so they can check it."
        />
        <InstructionStep
          number={5}
          text={
            <>
              If your teacher thinks you are done, they will mark it as
              complete. You need to refresh this page by clicking the{" "}
              <RotateCw className="mb-1 inline h-4 w-4" /> button or pressing
              F5.
            </>
          }
        />
      </ol>

      {/* Assignment Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-700">
          {/* Table Header */}
          <thead className="bg-teal-500 dark:bg-teal-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Description
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Data
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Working Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Complete
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium uppercase text-white">
                Completed At
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {assignments.map((assignment) => (
              <tr
                key={assignment.sa_id}
                className={`${
                  assignment.sa_complete
                    ? "bg-green-200 dark:bg-green-600"
                    : "bg-red-200 dark:bg-red-600"
                } transition-colors hover:bg-blue-100 dark:hover:bg-blue-500`}
              >
                {/* Assignment Name */}
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {assignment.assignment_name}
                  </span>
                </td>

                {/* Assignment Description */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.assignment_description ?? "—"}
                </td>

                {/* Assignment Data */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.assignment_data ?? "—"}
                </td>

                {/* Due Date */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.due_date ? formatDate(assignment.due_date) : "—"}
                </td>

                {/* Working Date */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.working_date
                    ? formatDate(assignment.working_date)
                    : "—"}
                </td>

                {/* Created Date */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {formatDate(assignment.created_date)}
                </td>

                {/* Topic */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.topic ?? "—"}
                </td>

                {/* Completion Status */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.sa_complete ? "✅ Yes" : "❌ No"}
                </td>

                {/* Completed At */}
                <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                  {assignment.sa_completed_ts
                    ? formatDateTime(assignment.sa_completed_ts)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// InstructionStep Component for Reusability
interface InstructionStepProps {
  number: number;
  text: React.ReactNode;
}

const InstructionStep: React.FC<InstructionStepProps> = ({ number, text }) => {
  return (
    <li className="flex items-start rounded-md bg-pink-100 p-4 transition-colors hover:bg-pink-200 dark:bg-gray-800 dark:hover:bg-pink-600">
      <span className="mr-4 text-lg font-bold text-orange-500">{number}.</span>
      <span className="text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
};

// Helper function to format dates
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);

  // Check if the date is the confusing default date
  if (
    date.getFullYear() === 1970 &&
    date.getMonth() === 0 && // Months are zero-based (0 = January)
    date.getDate() === 1 &&
    date.getHours() === 9 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  ) {
    return "—"; // Show a dash instead of the confusing date
  }

  // Format date to a more readable format, e.g., April 30, 2024
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
};

// Helper function to format date and time
const formatDateTime = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);

  // Check if the date is the confusing default date
  if (
    date.getFullYear() === 1970 &&
    date.getMonth() === 0 &&
    date.getDate() === 1 &&
    date.getHours() === 9 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  ) {
    return "—"; // Show a dash instead of the confusing date
  }

  // Format date and time to a more readable format, e.g., April 30, 2024, 5:00 PM
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return date.toLocaleString(undefined, options);
};

export default AssignmentTable;
