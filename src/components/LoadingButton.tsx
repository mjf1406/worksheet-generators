"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => Promise<void>;
  loading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  href,
  children,
  variant = "default",
  className,
  type = "button",
  onClick,
  loading: externalLoading,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  const handleClick = async (event: React.MouseEvent) => {
    if (isLoading) return;

    if (onClick) {
      event.preventDefault();
      setInternalLoading(true);
      try {
        await onClick();
      } finally {
        setInternalLoading(false);
      }
    } else if (href) {
      setInternalLoading(true);
    }
  };

  const buttonContent = (
    <>
      <span className={cn(isLoading && "invisible")}>{children}</span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
        </div>
      )}
    </>
  );

  const commonProps = {
    className: cn(
      className,
      "relative",
      isLoading && "cursor-not-allowed opacity-50",
    ),
    onClick: handleClick,
    disabled: isLoading,
  };

  if (href !== undefined) {
    return (
      <Button variant={variant} asChild {...commonProps}>
        <Link href={href}>
          <div className="flex items-center justify-center">
            {buttonContent}
          </div>
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} type={type} {...commonProps}>
      {buttonContent}
    </Button>
  );
};

export default LoadingButton;
