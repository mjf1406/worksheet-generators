// StudentData type as provided

import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import type { Assigner, AssignerItemStatuses, AssignerItemStatusesSeats, TeacherCourse } from "~/server/db/types";
import { shuffleArray } from "~/server/functions";
import type { AssignedData, AssignmentItem } from "../components/PDF";
import type { AssignerResult } from "../round-robin/RoundRobinClient";
import { updateAssigner } from "../round-robin/actions";

/* 
- tool: Assigner, Seats
  - need a new way to add this type of assigner, one where they can create groups from the items that they input into the text box
  - Randomize where girls and boys go? Odd or even
    - to ensure they don't sit next to each other again, if number is odd, add 1, and if even, subtract 1.
      - keep a list of students who are next to them in the DB and use the above to check it
      - this should still be over the year, though, to ensure they sit next to someone new as often as possible
  - seats are numbered 1-14
    - 1-4 is Dragon
    - 5-8 is Robot
    - 9-11 is Alien
    - 12-14 is Monkey
  - Algo steps
    1. shuffle student list to ensure randomness
    2. Define weights for each constraint (e.g., gender matching: 3, new neighbor: 2, new group member: 1).
    3. For each student, calculate a "suitability score" for each available seat based on these weighted constraints.
    4. Assign the student to the seat with the highest suitability score.
    5. If no seat meets a minimum threshold, add the student to a "difficult to place" list.
    6. After initial assignments, attempt to place "difficult" students with relaxed constraints.
*/

// Seating history schema per class, per student
export type SeatingHistory = Record<
  string,
  {
    neighbors: string[]; // Array of student IDs
    seats: number[]; // Array of seat numbers
  }
>;

// Seat type representing a seat and its group
type Seat = {
  number: number;
  group: string;
};

export type SeatGroup = {
    name: string,
    items: string[],
}

// Function to generate seats and assign them to groups
function generateSeats(items: string[], seatGroups: SeatGroup[]): Seat[] {
  const seats: Seat[] = [];
  for (const item of items) {
    const group = seatGroups.find(i => i.items.includes(item))?.name
    if (group) seats.push({ number: Number(item), group });
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

// Function to update seating history
function updateSeatingHistory(
  seatingHistory: SeatingHistory,
  students: StudentData[],
  seatingAssignments: Map<string, number>
) {
  for (const student of students) {
    const studentId = student.student_id;
    const seatNumber = seatingAssignments.get(studentId);
    if (seatNumber === undefined) continue;

    const adjacentSeats = getAdjacentSeats(seatNumber);
    const adjacentStudentIds = [];

    for (const adjSeat of adjacentSeats) {
      const adjStudentId = Array.from(seatingAssignments.entries()).find(
        ([_, seatNum]) => seatNum === adjSeat
      )?.[0];
      if (adjStudentId) {
        adjacentStudentIds.push(adjStudentId);
      }
    }

    if (!seatingHistory[studentId]) {
      seatingHistory[studentId] = { neighbors: [], seats: [] };
    }

    seatingHistory[studentId].neighbors.push(...adjacentStudentIds);
    seatingHistory[studentId].seats.push(seatNumber);
  }
}

function assignSeats(
  students: StudentData[],
  seatingHistory: SeatingHistory,
  items: string[],
  seatGroups: SeatGroup[],
  evenGender: "male" | "female",
): Map<string, number> {
  if (!seatGroups) throw new Error("seat groups is undefined.")
  const seats: Seat[] = generateSeats(items, seatGroups);
  const assignments = new Map<string, number>();
  const shuffledStudents = shuffleArray(students);
  const difficultToPlace: StudentData[] = [];

  // Separate students by gender
  const evenGenderStudents = shuffledStudents.filter(student => student.student_sex === evenGender);
  const oddGenderStudents = shuffledStudents.filter(student => student.student_sex !== evenGender);

  // Assign even seats to evenGender students
  const evenSeats = seats.filter(seat => seat.number % 2 === 0);
  assignStudentsToSeats(evenGenderStudents, evenSeats, assignments, seatingHistory, evenGender);

  // Assign odd seats to oddGender students
  const oddSeats = seats.filter(seat => seat.number % 2 !== 0);
  assignStudentsToSeats(oddGenderStudents, oddSeats, assignments, seatingHistory, evenGender);

  // Handle any remaining students (if there's an imbalance)
  const remainingStudents = [...evenGenderStudents, ...oddGenderStudents].filter(
    student => !assignments.has(student.student_id)
  );
  const remainingSeats = seats.filter(seat => !Array.from(assignments.values()).includes(seat.number));
  assignStudentsToSeats(remainingStudents, remainingSeats, assignments, seatingHistory, evenGender, true);

  return assignments;
}

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

    // Strict gender matching
    const isEvenSeat = seat.number % 2 === 0;
    const isEvenGenderStudent = student.student_sex === evenGender;
    if ((isEvenSeat && !isEvenGenderStudent) || (!isEvenSeat && isEvenGenderStudent)) {
      return { seat, score: -Infinity }; // Disallow mismatched gender-seat combinations
    }

    let score = 3; // Start with a base score for correct gender placement

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

// Updated runAssignerSeats function
export async function runAssignerSeats(
  classData: TeacherCourse,
  assignerData: Assigner,
  selectedGroups: string[]
): Promise<AssignerResult> {
  try {
    const evenGender = Math.random() < 0.5 ? "male" : "female";
    const classId = classData.class_id;
    const className = classData.class_name;
    const assignerId = assignerData.assigner_id;
    const assignerName = assignerData.name;
    const seatGroups = assignerData.groups
    const items: string[] = JSON.parse(assignerData.items) as string[];
    const students: StudentData[] = classData.students ?? [];
    if (students.length === 0)
      return { success: false, message: "No students in data" };

    let itemStatus: AssignerItemStatusesSeats | null = assignerData.student_item_status as unknown as AssignerItemStatusesSeats;
    if (!itemStatus) {
        const seatingHistory: SeatingHistory = {};
        itemStatus = createStudentItemStatusWithSeating(
            classId,
            assignerId,
            items,
            students,
            seatingHistory
        );
    }

    const assignedStudents: AssignedData = {
      name: assignerName,
      assignedData: {} as Record<string, AssignmentItem[]>,
    };

    if (!itemStatus[classId]) itemStatus = createStudentItemStatusClassStructure(classId, assignerId, items, students, itemStatus)
    const assignersItemStatus = itemStatus[classId];
    if (!assignersItemStatus)
      return {
        success: false,
        message:
          "No student item statuses for this class in the assigner data",
      };

    const studentItemStatus: SeatingHistory | undefined = assignersItemStatus[assignerId];
    if (!studentItemStatus)
      return {
        success: false,
        message: "No student item statuses in this class for this assigner",
      };

    const seatingHistory: SeatingHistory = studentItemStatus;

    if (selectedGroups && selectedGroups.length > 0) {
      for (const groupId of selectedGroups) {
        const groupData = classData.groups?.find(
          (group) => group.group_id === groupId
        );
        const groupName = groupData?.group_name;
        const groupStudents: StudentData[] | undefined = groupData?.students;
        if (groupName) assignedStudents.assignedData[groupName] = [];
        if (!groupStudents)
          throw new Error(
            "Something is wrong with the groups, please double check yours, then try again."
          );

          if (!seatGroups) throw new Error("seat groups is undefined.")
        const seatingAssignments = assignSeats(groupStudents, seatingHistory, items, seatGroups, evenGender);

        if (groupName && assignedStudents.assignedData[groupName]) {
            const groupAssignedData = groupStudents.map((student) => {
              const seatNumber = seatingAssignments.get(student.student_id)?.toString() ?? "-1"
              const group = seatGroups?.find(i => i.items.includes(seatNumber))?.name ?? "?";
              return {
                studentName: student.student_name_first_en,
                studentNumber: student.student_number,
                studentSex: student.student_sex,
                item: `${group} ${seatNumber}`,
              };
            });
            assignedStudents.assignedData[groupName].push(...groupAssignedData);
          }

        updateSeatingHistory(seatingHistory, groupStudents, seatingAssignments);
      }
    } else {
      // No groups selected, assign seats to all students
      if (className) assignedStudents.assignedData[className] = [];

      if (!seatGroups) throw new Error("seat groups is undefined.")
      const seatingAssignments = assignSeats(students, seatingHistory, items, seatGroups, evenGender);

      if (className && assignedStudents.assignedData[className]) {
        const classAssignedData = students.map((student) => {
            const seatNumber = seatingAssignments.get(student.student_id)?.toString() ?? "-1";
            const group = seatGroups?.find(g => g.items.includes(seatNumber))?.name ?? "?";
            return {
            studentName: student.student_name_first_en,
            studentNumber: student.student_number,
            studentSex: student.student_sex,
            item: `${group} ${seatNumber}`,
            };
        });
        assignedStudents.assignedData[className].push(...classAssignedData);
        }

      updateSeatingHistory(seatingHistory, students, seatingAssignments);
    }

    if (itemStatus?.[classId]){
        itemStatus[classId][assignerId] = seatingHistory;
        await updateAssigner(assignerId, itemStatus as unknown as AssignerItemStatuses);
    }
    
    return { success: true, data: assignedStudents };
} catch (err) {
    console.error("Failed to assign seats:", err);
    return { success: false, message: "Failed to run the seat assigner." };
  }
}
function createStudentItemStatusWithSeating(
    classId: string,
    assignerId: string,
    items: string[],
    studentData: StudentData[],
    seatingHistory: SeatingHistory
): AssignerItemStatusesSeats {
    const result: AssignerItemStatusesSeats = {
        [classId]: {
            [assignerId]: seatingHistory
        }
    };

    return result;
}

export function createStudentItemStatusClassStructure(
  classId: string,
  assignerId: string,
  items: string[],
  studentData: StudentData[],
  studentItemStatus: AssignerItemStatusesSeats
): AssignerItemStatusesSeats {
  if (!studentItemStatus[classId]) {
      studentItemStatus[classId] = {};
  }

  if (!studentItemStatus[classId][assignerId]) {
      studentItemStatus[classId][assignerId] = {};
  }

  for (const student of studentData) {
      const studentId = student.student_id;
      if (!studentItemStatus[classId][assignerId][studentId]) {
          studentItemStatus[classId][assignerId][studentId] = {
              neighbors: [],
              seats: []
          };
      }
  }

  return studentItemStatus;
}

function assignStudentsToSeats(
  students: StudentData[],
  availableSeats: Seat[],
  assignments: Map<string, number>,
  seatingHistory: SeatingHistory,
  evenGender: "male" | "female",
  relaxed = false
) {
  for (const student of students) {
    if (assignments.has(student.student_id)) continue;

    const seatScores = calculateSeatScores(
      student,
      availableSeats,
      assignments,
      seatingHistory,
      evenGender,
      relaxed
    );

    const bestSeat = seatScores.reduce(
      (a, b) => (a.score > b.score ? a : b),
      { seat: null as Seat | null, score: -Infinity }
    );

    if (bestSeat.seat) {
      assignments.set(student.student_id, bestSeat.seat.number);
      availableSeats = availableSeats.filter(seat => seat.number !== bestSeat.seat?.number);
    } else {
      console.error(`Could not place student ${student.student_id}`);
    }
  }
}