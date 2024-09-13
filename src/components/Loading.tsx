import React from "react";
import { Loader2 } from "lucide-react";
import { getRandomElement } from "~/server/functions";
import { LOADING_MESSAGES } from "~/lib/constants";

const message = getRandomElement(LOADING_MESSAGES);

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-20 w-20 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}
