"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getRandomElement } from "~/server/functions";
import { LOADING_MESSAGES } from "~/lib/constants";

const initialMessage =
  getRandomElement(LOADING_MESSAGES) ??
  "Mixing knowledge potions... almost ready!";

export default function LoadingPage() {
  const [message, setMessage] = useState<string>(initialMessage);

  useEffect(() => {
    const msg = getRandomElement(LOADING_MESSAGES);
    if (msg) setMessage(msg);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-20 w-20 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}
