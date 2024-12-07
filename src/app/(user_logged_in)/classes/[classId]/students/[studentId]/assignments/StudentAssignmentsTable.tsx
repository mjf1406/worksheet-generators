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
import styles from "./AssignmentTable.module.css"; // Import CSS module for styling
import { RefreshCcw, RotateCw } from "lucide-react";

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
    <div className={styles.container}>
      {/* Introduction for the students */}
      <div className={styles.intro}>
        <p>Here are your assignments for today! Follow these steps:</p>
      </div>

      {/* Instructional Steps */}
      <ol className={styles.instructions}>
        <li className={styles.instructionItem}>
          <span className={styles.icon}>1.</span>
          <span>
            Read the description to make sure you know what the assignment is.
          </span>
        </li>
        <li className={styles.instructionItem}>
          <span className={styles.icon}>2.</span>
          <span>Complete the assignments in order from top to bottom.</span>
        </li>
        <li className={styles.instructionItem}>
          <span className={styles.icon}>3.</span>
          <span>
            If you have questions, ask your desk partner and teammates before
            you ask your teacher.
          </span>
        </li>
        <li className={styles.instructionItem}>
          <span className={styles.icon}>4.</span>
          <span>
            When you finish an assignment, bring it to your teacher so they can
            check it.
          </span>
        </li>
        <li className={styles.instructionItem}>
          <span className={styles.icon}>5.</span>
          <span>
            If your teacher thinks you are done, they will mark it as complete.
            You need to refresh this page by clicking the{" "}
            <RotateCw className="mb-1 inline h-4 w-4" /> button or pressing F5.
          </span>
        </li>
      </ol>

      {/* Assignment Table */}
      <Table className={styles.table}>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Description</TableHead>
            <TableHead className="text-foreground">Data</TableHead>
            <TableHead className="text-foreground">Due Date</TableHead>
            <TableHead className="text-foreground">Working Date</TableHead>
            <TableHead className="text-foreground">Created Date</TableHead>
            <TableHead className="text-foreground">Topic</TableHead>
            <TableHead className="text-foreground">Complete</TableHead>
            <TableHead className="text-foreground">Completed At</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow
              key={assignment.sa_id}
              className={`${styles.row} ${assignment.sa_complete ? styles.completed : styles.pending}`}
            >
              {/* Assignment Name */}
              <TableCell>
                <span className={styles.boldText}>
                  {assignment.assignment_name}
                </span>
              </TableCell>

              {/* Assignment Description */}
              <TableCell>{assignment.assignment_description ?? "—"}</TableCell>

              {/* Assignment Data */}
              <TableCell>{assignment.assignment_data ?? "—"}</TableCell>

              {/* Due Date */}
              <TableCell>
                {assignment.due_date ? formatDate(assignment.due_date) : "—"}
              </TableCell>

              {/* Working Date */}
              <TableCell>
                {assignment.working_date
                  ? formatDate(assignment.working_date)
                  : "—"}
              </TableCell>

              {/* Created Date */}
              <TableCell>{formatDate(assignment.created_date)}</TableCell>

              {/* Topic */}
              <TableCell>{assignment.topic ?? "—"}</TableCell>

              {/* Completion Status */}
              <TableCell>
                {assignment.sa_complete ? "✅ Yes" : "❌ No"}
              </TableCell>

              {/* Completed At */}
              <TableCell>
                {assignment.sa_completed_ts
                  ? formatDateTime(assignment.sa_completed_ts)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
