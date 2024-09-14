import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { Button } from "./ui/button";

export function AIBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            className="h-6 w-6 rounded-full text-center text-sm font-bold text-background hover:bg-secondary"
          >
            AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This item uses AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
