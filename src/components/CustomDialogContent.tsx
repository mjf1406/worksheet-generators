// CustomDialogContent.tsx

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";
import React from "react";

const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200",
        // Removed 'max-w-lg' from here
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
        <span className="sr-only">Close</span>
        {/* You can add a close icon here if desired */}
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

export default CustomDialogContent;
