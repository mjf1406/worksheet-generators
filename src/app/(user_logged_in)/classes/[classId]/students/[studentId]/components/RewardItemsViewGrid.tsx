import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Coins } from "lucide-react";
import { FontAwesomeIconClient } from "~/components/FontAwesomeIconClient";

interface RewardItem {
  price: number;
  name: string;
  description?: string | null;
  icon?: string | null;
}

interface RewardItemsViewGridProps {
  rewardItems: RewardItem[];
}

export default function RewardItemsViewGrid({
  rewardItems,
}: RewardItemsViewGridProps) {
  if (!rewardItems.length) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No reward items available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewardItems.map((item, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {item.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-amber-500">
                  <Coins size={20} />
                  <span className="font-bold">{item.price}</span>
                </div>
              </div>
              <CardDescription className="text-base text-gray-500">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex h-full items-center justify-center">
                <FontAwesomeIconClient
                  icon={item.icon}
                  size={96}
                  className="text-accent"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
