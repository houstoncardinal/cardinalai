import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      avoidCollisions
      collisionPadding={8}
      className={cn(
        "z-[9999] overflow-hidden rounded-xl border-2 border-white/30 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a14] backdrop-blur-xl px-5 py-3 text-sm text-white shadow-[0_20px_70px_-10px_rgba(0,0,0,0.9),0_0_50px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.05] before:to-transparent before:pointer-events-none",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
