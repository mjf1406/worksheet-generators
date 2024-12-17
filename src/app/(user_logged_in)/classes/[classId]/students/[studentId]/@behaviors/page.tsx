// app/[classId]/[studentId]/@behaviors/page.tsx
import { db } from "~/server/db";
import { points, behaviors, reward_items } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import StudentBehaviorLeadersCard from "../components/StudentBehaviorLeadersCard";

interface BehaviorRankAggregate {
  behavior: string;
  type: string;
  totalPoints: number;
  otherStudentsCount?: number;
}

export default async function BehaviorsPage({
  params,
}: {
  params: { classId: string; studentId: string };
}) {
  const { classId, studentId } = params;

  const allClassPointsData = await db
    .select({
      id: points.id,
      student_id: points.student_id,
      behavior_id: points.behavior_id,
      type: points.type,
      number_of_points: points.number_of_points,
      created_date: points.created_date,
      behavior_name: behaviors.name,
      reward_item_name: reward_items.name,
    })
    .from(points)
    .leftJoin(behaviors, eq(behaviors.behavior_id, points.behavior_id))
    .leftJoin(reward_items, eq(reward_items.item_id, points.reward_item_id))
    .where(eq(points.class_id, classId));

  // Aggregate points by (behavior_id, student_id)
  const behaviorMap = new Map<string, Map<string, number>>();
  const behaviorTypeMap = new Map<
    string,
    { behavior_name: string; type: string }
  >();

  for (const p of allClassPointsData) {
    if (!p.behavior_id || !p.behavior_name) continue;
    const behaviorKey = p.behavior_id;
    if (!behaviorMap.has(behaviorKey)) {
      behaviorMap.set(behaviorKey, new Map());
      behaviorTypeMap.set(behaviorKey, {
        behavior_name: p.behavior_name,
        type: p.type,
      });
    }
    const studentPoints = behaviorMap.get(behaviorKey)!;
    const currentPoints = studentPoints.get(p.student_id) ?? 0;
    studentPoints.set(p.student_id, currentPoints + (p.number_of_points ?? 0));
  }

  const topPositiveBehaviors: BehaviorRankAggregate[] = [];
  const topNegativeBehaviors: BehaviorRankAggregate[] = [];

  for (const [behaviorKey, studentScores] of behaviorMap.entries()) {
    const { behavior_name, type } = behaviorTypeMap.get(behaviorKey)!;
    if (!behavior_name) continue;

    const entries = Array.from(studentScores.entries()); // [ [student_id, totalPoints], ... ]

    if (type === "positive") {
      // max is #1
      const maxPoints = Math.max(...entries.map(([_, pts]) => pts));
      const topStudents = entries
        .filter(([_, pts]) => pts === maxPoints)
        .map(([id]) => id);

      if (topStudents.includes(studentId)) {
        const otherStudentsCount = topStudents.length - 1;
        topPositiveBehaviors.push({
          behavior: behavior_name,
          type,
          totalPoints: maxPoints,
          otherStudentsCount,
        });
      }
    } else if (type === "negative") {
      // min is #1
      const minPoints = Math.min(...entries.map(([_, pts]) => pts));
      const bottomStudents = entries
        .filter(([_, pts]) => pts === minPoints)
        .map(([id]) => id);

      if (bottomStudents.includes(studentId)) {
        const otherStudentsCount = bottomStudents.length - 1;
        topNegativeBehaviors.push({
          behavior: behavior_name,
          type,
          totalPoints: minPoints,
          otherStudentsCount,
        });
      }
    }
  }

  return (
    <div className="md:col-span-1">
      <StudentBehaviorLeadersCard
        topPositive={topPositiveBehaviors}
        topNegative={topNegativeBehaviors}
      />
    </div>
  );
}
