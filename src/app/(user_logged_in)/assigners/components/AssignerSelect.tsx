"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { AssignerGroup } from "./CreateAssignerDialog";

interface Assigner {
  assigner_id: string;
  name: string;
  user_id: string;
  assigner_type: "random" | "round-robin";
  items: string;
  group?: AssignerGroup[];
  student_item_status: Record<string, unknown> | null;
  created_date: string;
  updated_date: string;
}

interface SelectProps {
  onAssignerSelect: (assignerId: string) => void;
  assigners: Assigner[];
}

export default function AssignerSelect({
  onAssignerSelect,
  assigners,
}: SelectProps) {
  const pathname = usePathname();

  const filteredAssigners = useMemo(() => {
    const type = pathname?.split("/").pop() as
      | "random"
      | "round-robin"
      | undefined;
    return assigners.filter((assigner) => assigner.assigner_type === type);
  }, [assigners, pathname]);

  return (
    <div className="flex w-full items-center gap-2">
      <Select onValueChange={onAssignerSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Assigner" />
        </SelectTrigger>
        <SelectContent>
          {filteredAssigners.map((assigner) => (
            <SelectItem key={assigner.assigner_id} value={assigner.assigner_id}>
              {assigner.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
