"use client";

import { ModeToggle } from "../theme/theme-toggle";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "../ui/button";
import Link from "next/link";
import { Loader2, User } from "lucide-react";
import React from "react";

export default function UserAndTheme() {
  const { isSignedIn } = useAuth();
  const { loaded } = useClerk();
  const [isLoading, loadingSignIn] = React.useState(false);

  const handleClick = () => {
    loadingSignIn(true);
  };

  return (
    <>
      <div className="flex min-w-24 items-center justify-end gap-4">
        {!isSignedIn ? (
          <SignedOut>
            <div>
              {isLoading ? (
                <Button
                  disabled={true}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </Button>
              ) : (
                <Button asChild onClick={handleClick}>
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
              )}
            </div>
          </SignedOut>
        ) : loaded ? (
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        ) : (
          <div>
            <Skeleton className="flex h-[30px] w-[30px] items-center justify-center rounded-full">
              <User></User>
            </Skeleton>
          </div>
        )}
        <ModeToggle />
      </div>
    </>
  );
}
