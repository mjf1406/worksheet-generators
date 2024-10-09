// components/ui/PopoverContentInline.tsx

"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "~/lib/utils"; // Adjust the import path based on your project structure

interface PopoverContentInlineProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  // You can extend or add custom props here if needed
  foo?: boolean;
}

const PopoverContentInline = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentInlineProps
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    // Adjust the class names as per your styling requirements
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in",
      className,
    )}
    {...props}
  />
));

PopoverContentInline.displayName = PopoverPrimitive.Content.displayName;

export default PopoverContentInline;
