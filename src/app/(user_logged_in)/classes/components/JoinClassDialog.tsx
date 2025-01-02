"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ClipboardPaste, HeartHandshake } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { joinClass } from "../[classId]/actions/joinClass";
import { useToast } from "~/components/ui/use-toast";

const JoinClassDialog = () => {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isOpen, setIsOpen] = useState(false); // Dialog open state
  const router = useRouter();
  const { toast } = useToast();

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClassCode(text);
    } catch (error) {
      alert("Failed to read from clipboard. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    if (!classCode.trim()) {
      toast({
        title: "Empty Class Code",
        description: "Please enter or paste a valid class code.",
        variant: "default",
      });
      setIsLoading(false); // Stop loading
      return;
    }

    try {
      const response = await joinClass(classCode);

      if (response.success) {
        toast({
          title: "Class Joined!",
          description: "You have successfully joined the class!",
        });
        setIsOpen(false); // Close dialog on success
        window.location.reload();
      } else {
        toast({
          title: "Failed to join class!",
          description:
            response.message ?? "Unable to join the class. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description:
          "An error occurred while joining the class. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <HeartHandshake className="mr-2" size={20} />
          Join Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the class code to join as an assistant teacher.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label
              htmlFor="classCode"
              className="block text-sm font-medium text-gray-700"
            >
              Class Code
            </label>
            <div className="flex items-center gap-1">
              <Input
                id="classCode"
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                required
                placeholder="Enter your class code"
                className="mt-1 block w-full"
                disabled={isLoading} // Disable input while loading
              />
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Button
                      type="button"
                      variant="ghost"
                      size={"icon"}
                      onClick={handlePasteFromClipboard}
                      disabled={isLoading} // Disable button while loading
                    >
                      <ClipboardPaste size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paste</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="default" disabled={isLoading}>
              {isLoading ? (
                // You can replace this with a spinner component if available
                <span className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Joining...
                </span>
              ) : (
                "Join"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinClassDialog;
