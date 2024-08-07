"use client";

import { useEffect, useState } from "react";
import type { Assigner } from "~/server/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface SelectProps {
  onAssignerSelect: (assignerId: string) => void;
}

async function fetchAssigners(
  userId: string | null | undefined,
  type: "random" | "round-robin" | null,
): Promise<Assigner[]> {
  if (!userId) throw new Error("User not authenticated");
  if (!type) throw new Error("Type is undefined");
  try {
    const params = new URLSearchParams({
      userId: userId,
      type: type,
    });

    const response = await fetch(`/api/assigners?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch assigners");
    }
    const text: string = await response.text(); // Make this operation await so it completes here
    const data: Assigner[] = JSON.parse(text) as Assigner[];
    return data;
  } catch (err) {
    const error = err as Error;
    console.error("failed to parse assigners", error);
    throw new Error("failed to parse assigners");
  }
}

export default function AssignerSelect({ onAssignerSelect }: SelectProps) {
  const [assigners, setAssigners] = useState<Assigner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const pathname = usePathname();
  const [urlParam, setUrlParam] = useState<"random" | "round-robin" | null>(
    null,
  );

  useEffect(() => {
    void fetchAssigners(userId, urlParam)
      .then((data) => {
        setAssigners(data);
        setIsLoading(false);
      })
      .catch((error) => {
        const err = error as Error;
        console.error("failed to fetch assigners data", err);
        throw new Error("failed to fetch assigners", err);
      });
  }, [userId, urlParam]);

  useEffect(() => {
    if (pathname) {
      const segments = pathname.split("/");
      const lastSegment = segments[segments.length - 1];
      setUrlParam(lastSegment as "random" | "round-robin" | null);
    }
  }, [pathname]);

  return (
    <div className="flex w-full items-center gap-2">
      <Select onValueChange={onAssignerSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Assigner"} />
        </SelectTrigger>
        <SelectContent>
          {assigners.map((assigner) => (
            <SelectItem key={assigner.assigner_id} value={assigner.assigner_id}>
              {assigner.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
