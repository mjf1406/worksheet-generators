"use client";

import { HelpCircle } from "lucide-react";
import React from "react";
import { dmMono } from "~/app/fonts";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip"; // Adjust the import path as needed
import { useToast } from "~/components/ui/use-toast";

type ClassCodeDisplayProps = {
  classCode: string;
  role: string;
};

const ClassCodeDisplay: React.FC<ClassCodeDisplayProps> = ({
  classCode,
  role,
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(classCode).then(
      () => {
        toast({
          title: "Copied!",
          description: "Class code has been copied to your clipboard.",
          variant: "default",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy class code.",
          variant: "destructive",
        });
      },
    );
  };

  return (
    <div className="flex items-center gap-1">
      {role === "primary" && (
        <>
          <div
            className="ml-2 flex w-fit cursor-pointer items-center text-2xl hover:bg-background"
            onClick={copyToClipboard}
            title="Click to copy class code"
          >
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="flex cursor-pointer items-center gap-2">
                  <p className={`font-bold ${dmMono.className}`}>{classCode}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="flex cursor-help items-center gap-2">
                <HelpCircle size={22} />
              </TooltipTrigger>
              <TooltipContent className="break-text max-w-sm">
                <p>
                  This is your class code. Send it to other teachers so they can
                  join as assistant teachers. Assistant teachers can only apply
                  behaviors and mark/unmark tasks complete.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
};

export default ClassCodeDisplay;
