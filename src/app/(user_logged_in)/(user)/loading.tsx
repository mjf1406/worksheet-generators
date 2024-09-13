import React from "react";
import { Loader2 } from "lucide-react";
import { getRandomElement } from "~/server/functions";
import { LOADING_MESSAGES } from "~/lib/constants";
import Ripple from "~/components/magicui/ripple";

const message = getRandomElement(LOADING_MESSAGES);

export default function Loading() {
  return (
    <div className="relative flex h-[1000px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-3xl font-medium tracking-tighter text-white">
        {message}
      </p>
      <Ripple />
    </div>
    // <div className="flex h-screen w-full items-center justify-center">
    //   <div className="flex flex-col items-center gap-2">
    //     <Loader2 className="h-8 w-8 animate-spin text-primary" />
    //     <Ripple></Ripple>
    //     <p className="text-lg font-medium text-foreground">{message}</p>
    //   </div>
    // </div>
  );
}
