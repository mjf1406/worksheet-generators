import { Construction, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

export type ItemGridData = {
  name: string;
  description: string;
  icon: LucideIcon;
  badge?: ReactNode;
  href: string;
  under_construction?: boolean;
};

function ItemGrid({ data }: { data: ItemGridData[] }) {
  return (
    <div className="mx-auto w-full space-y-8 p-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((item) => {
          const cardContent = (
            <Card
              className={cn(
                "m-auto h-full w-full",
                item.under_construction && "cursor-not-allowed opacity-50",
              )}
            >
              <CardHeader className="justify-center">
                <div className="mb-2 flex items-center gap-2">
                  <item.icon className="h-6 w-6" />
                  <CardTitle>{item.name}</CardTitle>
                  {item.badge && <div className="self-start">{item.badge}</div>}
                </div>
                <CardDescription className="text-muted/80">
                  {item.description}
                </CardDescription>
              </CardHeader>
              {item.under_construction && (
                <CardFooter className="self-end opacity-100">
                  <Construction className="mr-2" /> This item is under
                  construction
                </CardFooter>
              )}
            </Card>
          );

          return item.under_construction ? (
            <div key={item.name}>{cardContent}</div>
          ) : (
            <Link href={item.href} key={item.name}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ItemGrid;
