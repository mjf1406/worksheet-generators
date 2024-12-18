import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { reward_items } from "~/server/db/schema";
import RewardItemsViewGrid from "../components/RewardItemsViewCard";

interface Params {
  classId: string;
  studentId: string;
}

export default async function rewardItemsCard({ params }: { params: Params }) {
  const { classId, studentId } = params;
  if (!classId || !studentId) {
    return <div className="p-5 pl-10 text-red-500">Invalid parameters.</div>;
  }

  const rewardItems = await db
    .select({
      price: reward_items.price,
      name: reward_items.name,
      description: reward_items.description,
      icon: reward_items.icon,
    })
    .from(reward_items)
    .where(eq(reward_items.class_id, classId));

  return <RewardItemsViewGrid rewardItems={rewardItems} />;
}
