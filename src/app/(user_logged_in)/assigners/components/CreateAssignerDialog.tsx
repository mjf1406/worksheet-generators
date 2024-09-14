import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
import { Info } from "lucide-react";

interface AssignerDialogProps {
  onAssignerCreated: () => void;
}

const AssignerDialog: React.FC<AssignerDialogProps> = ({
  onAssignerCreated,
}) => {
  const [name, setName] = useState("");
  const [items, setItems] = useState(
    "Item1, Item2, Item3, ... \n~OR~ \nItem1 \nItem2 \nItem3 \n...",
  );
  const [type, setType] = useState("random");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

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
      const result = await createAssigner({
        name,
        items: items.includes(",")
          ? items.split(",").map((item) => item.trim())
          : items.split("\n").map((item) => item.trim()),
        type: type as "random" | "round-robin",
      });

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
      console.error("Error submitting students:", error);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Assigner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="items">
              Items (comma-separated or line-separated)
            </Label>
            <div className="flex items-center justify-center gap-2 bg-accent px-2 py-1 text-background">
              <div>
                <Info className="h-7 w-7" />
              </div>
              <p className="text-xs">
                Duplicate items will result in both a male and female being
                assigned for Round-Robin Assigners only.
              </p>
            </div>
            <Textarea
              id="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="h-40"
              // placeholder="Item1, Item2, Item3, ... \n~OR~ \nItem1 \nItem2 \nItem3 \n..."
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
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Assigner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignerDialog;
