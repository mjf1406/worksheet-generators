"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import LoadingButton from "~/components/LoadingButton";

const AuthButton: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return (
      <LoadingButton href="/classes" variant="default" className="px-8">
        <div className="flex">
          Classes
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </LoadingButton>
    );
  }

  return (
    <LoadingButton href="/sign-in" variant="default">
      <div className="flex">
        Sign in to get started
        <ArrowRight className="ml-2 h-5 w-5" />
      </div>
    </LoadingButton>
  );
};

export default AuthButton;
