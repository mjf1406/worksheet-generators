import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { createAssigner } from "../random/actions";
import { useToast } from "~/components/ui/use-toast";
import { Info, Plus, Trash } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";

interface AssignerDialogProps {
  onAssignerCreated: () => void;
}

export type AssignerGroup = {
  id: number;
  name: string;
};

type Payload = {
  type: "seats" | "random" | "round-robin";
  name: string;
  items: string[];
  created_date?: string | null | undefined;
  updated_date?: string | null | undefined;
  groups?: { name: string; items: string[] }[]; // Add this line
};

const AssignerDialog: React.FC<AssignerDialogProps> = ({
  onAssignerCreated,
}) => {
  const [name, setName] = useState("");
  const [items, setItems] = useState(
    "Item1, Item2, Item3, ... \n~OR~ \nItem1 \nItem2 \nItem3 \n...",
  );
  const [itemsArray, setItemsArray] = useState<string[]>([]);
  const [type, setType] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [groups, setGroups] = useState<AssignerGroup[]>([]);
  const [itemAssignments, setItemAssignments] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const parsedItems = items.includes(",")
      ? items.split(",").map((item) => item.trim())
      : items.split("\n").map((item) => item.trim());
    setItemsArray(parsedItems);
  }, [items]);

  useEffect(() => {
    if (type === "seats") {
      // Initialize groups and item assignments
      setGroups([]);
      setItemAssignments({});
    }
  }, [type]);

  const handleAddGroup = () => {
    const newGroupId =
      groups.length > 0 ? groups[groups.length - 1]!.id + 1 : 1;
    setGroups([...groups, { id: newGroupId, name: "" }]);
  };

  const handleGroupNameChange = (groupId: number, name: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, name } : group,
      ),
    );
  };

  const handleRemoveGroup = (groupId: number) => {
    setGroups(groups.filter((group) => group.id !== groupId));
    // Remove item assignments to this group
    const updatedAssignments = { ...itemAssignments };
    Object.keys(updatedAssignments).forEach((item) => {
      if (updatedAssignments[item] === groupId) {
        delete updatedAssignments[item];
      }
    });
    setItemAssignments(updatedAssignments);
  };

  const handleAssignItemToGroup = (item: string, groupIdStr: string) => {
    const groupId = groupIdStr ? parseInt(groupIdStr, 10) : undefined;
    if (groupId) {
      setItemAssignments({
        ...itemAssignments,
        [item]: groupId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (
        items.includes("Item1") ||
        items.includes("Item2") ||
        items.includes("Item3")
      ) {
        throw new Error("Please ensure your Items are formatted correctly.");
      }

      let payload: Payload;
      if (type === "seats") {
        // Validate groups
        if (groups.length === 0) {
          throw new Error("Please add at least one group.");
        }
        if (groups.some((group) => !group.name)) {
          throw new Error("Please provide names for all groups.");
        }
        // Ensure all items are assigned
        const assignedItems = Object.keys(itemAssignments);
        if (assignedItems.length !== itemsArray.length) {
          throw new Error("Please assign all items to groups.");
        }
        // Build groups with their items
        const groupsWithItems = groups.map((group) => ({
          name: group.name,
          items: itemsArray.filter(
            (item) => itemAssignments[item] === group.id,
          ),
        }));
        payload = {
          name,
          items: items.includes(",")
            ? items.split(",").map((item) => item.trim())
            : items.split("\n").map((item) => item.trim()),
          groups: groupsWithItems,
          type: "seats",
        };
      } else {
        payload = {
          name,
          items: items.includes(",")
            ? items.split(",").map((item) => item.trim())
            : items.split("\n").map((item) => item.trim()),
          type: type as "random" | "round-robin",
        };
      }

      const result = await createAssigner(payload);

      if (result.success) {
        toast({
          title: "Success",
          description: `Created the Assigner named ${name}!`,
        });
        setIsOpen(false); // Close the dialog
        onAssignerCreated(); // Call the callback to trigger data refetch
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        if (result.errors) {
          console.error("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error submitting assigner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="mb-3">
          Create Assigner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Assigner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Type Fields */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assigner name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Assignment Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="seats">Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Input */}
          {type && (
            <div className="space-y-2">
              <Label htmlFor="items">
                Items (comma-separated or line-separated)
              </Label>
              <div className="flex items-center gap-2 bg-accent px-2 py-1 text-background">
                <div>
                  <Info className="h-7 w-7" />
                </div>
                <p className="text-xs">
                  {" "}
                  {type === "seats"
                    ? "We recommend you use numbers for your seat items."
                    : " Duplicate items will result in both a male and female being assigned for Round-Robin Assigners only."}
                </p>
              </div>
              <Textarea
                id="items"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="h-32 text-sm"
              />
            </div>
          )}

          {/* Groups and Assignment for 'Seats' Type */}
          {type === "seats" && (
            <div className="space-y-4">
              {/* Groups Management */}
              <div className="space-y-2">
                <Label>Groups</Label>
                <Button
                  variant={"secondary"}
                  className="flex items-center justify-center gap-2"
                  onClick={handleAddGroup}
                >
                  <Plus className="h-7 w-6" />
                  Add Group
                </Button>
                <div className="flex flex-wrap gap-1">
                  {groups.map((group, index) => (
                    <div
                      key={group.id}
                      className="flex w-full items-center gap-2 bg-foreground/10 p-1 sm:w-[calc(50%-0.5rem)] md:w-[calc(33%-0.5rem)] lg:w-[calc(25%-0.5rem)]"
                    >
                      <Input
                        value={group.name}
                        onChange={(e) =>
                          handleGroupNameChange(group.id, e.target.value)
                        }
                        placeholder={`Group ${index + 1} Name`}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size={"icon"}
                        variant="destructive"
                        onClick={() => handleRemoveGroup(group.id)}
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Items to Groups */}
              <div className="space-y-2">
                <Label>Assign Items to Groups</Label>
                <div className="flex flex-wrap gap-1">
                  {itemsArray.map((item) => (
                    <div
                      key={item}
                      className="flex w-full items-center gap-2 bg-foreground/10 p-1 sm:w-[calc(50%-0.5rem)] md:w-[calc(33%-0.5rem)] lg:w-[calc(25%-0.5rem)]"
                    >
                      <span className="ml-2 w-1/2 text-sm">{item}</span>
                      <select
                        className="w-1/2 rounded border p-1 text-sm"
                        value={itemAssignments[item] ?? ""}
                        onChange={(e) =>
                          handleAssignItemToGroup(item, e.target.value)
                        }
                      >
                        <option value="">Select Group</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name || `Group ${group.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Assigner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignerDialog;
