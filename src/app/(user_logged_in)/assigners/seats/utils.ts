// StudentData type as provided

import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import type { Assigner, AssignerItemStatuses, AssignerItemStatusesAssigner, Group, TeacherCourse } from "~/server/db/types";
import { shuffleArray } from "~/server/functions";
import type { AssignedData, AssignmentItem } from "../components/PDF";
import { createStudentItemStatusStructure } from "../round-robin/utils";

export async function runAssignerSeats( classData: TeacherCourse, assignerData: Assigner, selectedGroups: Group[] ){
  const classId = classData.class_id;
  const className = classData.class_name;
  const assignerId = assignerData.assigner_id;
  const assignerName = assignerData.name;
  const items: string[] = JSON.parse(assignerData.items) as string[];
  const students: StudentData[] = classData.students ?? [];
  if (students.length === 0) return {success: false, message: "No students in data"};

  let itemStatus: AssignerItemStatuses | null = assignerData.student_item_status;
  if (!itemStatus) itemStatus = createStudentItemStatusStructure(classId, assignerId, items, students);
  const assignedStudents: AssignedData = { 
      name: assignerName, 
      assignedData: {} as Record<string, AssignmentItem[]>
  };
  
  const assignersItemStatus = itemStatus[classId];
  if (!assignersItemStatus) return { success: false, message: "No student item statuses for this class in the assigner data"};
  
  // const studentItemStatus: AssignerItemStatusesAssigner | undefined = assignersItemStatus[assignerId] as unknown as AssignerItemStatusesAssigner;
  // if (!studentItemStatus) return { success: false, message: "No student item statuses in this class for this assigner"};
  
  // const seatingHistory: SeatingHistory = studentItemStatus
  // const seatingAssignmnets = assignSeats( students, seatingHistory )
  // const assignedData = seatingAssignmnets

  const assignedData = null
  return { success: true, data: assignedData }
}

// Seating history schema per class, per student
type SeatingHistory = Record<string, {
      neighbors: string[]; // Array of student IDs
      seats: number[];     // Array of seat numbers
  }>;

// Seat type representing a seat and its group
type Seat = {
  number: number;
  group: string;
};

// Function to generate seats and assign them to groups
function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  for (let i = 1; i <= 30; i++) {
      const group = String.fromCharCode(65 + ((i - 1) % 6)); // Groups A to F
      seats.push({ number: i, group });
  }
  return seats;
}

// Function to get adjacent seat numbers for a given seat
function getAdjacentSeats(seatNumber: number): number[] {
  const adjacentSeats = [];
  if (seatNumber > 1) {
      adjacentSeats.push(seatNumber - 1);
  }
  if (seatNumber < 30) {
      adjacentSeats.push(seatNumber + 1);
  }
  return adjacentSeats;
}

// Main function to assign seats to students
function assignSeats(
  students: StudentData[],
  seatingHistory: SeatingHistory
): Map<string, number> {
  const seats: Seat[] = generateSeats();
  const assignments = new Map<string, number>();
  const shuffledStudents = shuffleArray(students);
  const evenGender = Math.random() < 0.5 ? "male" : "female";
  const difficultToPlace: StudentData[] = [];

  for (const student of shuffledStudents) {
      const seatScores = calculateSeatScores(
          student,
          seats,
          assignments,
          seatingHistory,
          evenGender
      );
      const bestSeat = seatScores.reduce(
          (a, b) => (a.score > b.score ? a : b),
          { seat: null as Seat | null, score: -Infinity }
      );

      if (bestSeat.score > 0 && bestSeat.seat) {
          assignments.set(student.student_id, bestSeat.seat.number);
      } else {
          difficultToPlace.push(student);
      }
  }

  // Place difficult students with relaxed constraints
  for (const student of difficultToPlace) {
      const availableSeats = seats.filter(
          (seat) => !Array.from(assignments.values()).includes(seat.number)
      );
      const seatScores = calculateSeatScores(
          student,
          availableSeats,
          assignments,
          seatingHistory,
          evenGender,
          true
      );
      const bestSeat = seatScores.reduce(
          (a, b) => (a.score > b.score ? a : b),
          { seat: null as Seat | null, score: -Infinity }
      );

      if (bestSeat.seat) {
          assignments.set(student.student_id, bestSeat.seat.number);
      } else {
          console.log(`Could not place student ${student.student_id}`);
      }
  }

  return assignments;
}

// Function to calculate seat scores for a student
function calculateSeatScores(
  student: StudentData,
  seats: Seat[],
  assignments: Map<string, number>,
  seatingHistory: SeatingHistory,
  evenGender: "male" | "female",
  relaxed = false
): { seat: Seat; score: number }[] {
  return seats.map((seat) => {
      // Skip if the seat is already assigned
      if (Array.from(assignments.values()).includes(seat.number)) {
          return { seat, score: -Infinity };
      }

      let score = 0;

      // Gender matching
      if (
          (seat.number % 2 === 0 && student.student_sex === evenGender) ||
          (seat.number % 2 !== 0 && student.student_sex !== evenGender)
      ) {
          score += 3;
      }

      // Avoid seating next to previous neighbors
      const adjacentSeats = getAdjacentSeats(seat.number);
      const adjacentStudents = adjacentSeats
          .map((s) => {
              const studentId = Array.from(assignments.entries()).find(
                  ([_, seatNum]) => seatNum === s
              )?.[0];
              return studentId;
          })
          .filter((id): id is string => id !== undefined);

      const previousNeighbors = new Set(
          seatingHistory[student.student_id]?.neighbors ?? []
      );
      const hasPreviousNeighbor = adjacentStudents.some((id) =>
          previousNeighbors.has(id)
      );

      if (!hasPreviousNeighbor) {
          score += 2;
      }

      // Avoid assigning the same seat as before
      const previousSeats = seatingHistory[student.student_id]?.seats ?? [];
      if (!previousSeats.includes(seat.number)) {
          score += 1;
      }

      return { seat, score: relaxed ? Math.max(score, 0) : score };
  });
}
