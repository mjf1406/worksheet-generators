import { Suspense } from "react";
import { db } from "~/server/db";
import { behaviors, points, reward_items } from "~/server/db/schema";
import PointsCard from "../components/PointsCard";
import { eq } from "drizzle-orm";

export default async function PointsPage({
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

  // Move data transformation to server side
  const studentPoints = allClassPointsData
    .filter((p) => p.student_id === studentId)
    .map((p) => ({
      id: p.id,
      type: p.type,
      number_of_points: p.number_of_points ?? 0,
      behavior_name: p.behavior_name ?? null,
      reward_item_name: p.reward_item_name ?? null,
      created_date: p.created_date?.toString() ?? new Date().toISOString(),
    }));

  return (
    <div className="md:col-span-1">
      <Suspense fallback={<div>Loading points...</div>}>
        <PointsCard pointsData={studentPoints} />
      </Suspense>
    </div>
  );
}
