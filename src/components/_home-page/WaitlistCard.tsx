// app/components/WaitlistCard.tsx
"use client";

import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useTransition } from "react";
import { joinBetaWaitlist } from "./actions/joinBetaWaitlist";

// Define the Zod schema for email validation
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const WaitlistCard = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate the email using Zod
    const validation = emailSchema.safeParse({ email });

    if (!validation.success) {
      // Extract and set the first error message
      const firstError =
        validation?.error?.errors[0]?.message ?? "Invalid email.";
      setError(firstError);
      return;
    }

    setStatus("loading");

    try {
      const identifier = "anonymous";

      // Call the server action
      const result = await joinBetaWaitlist(email, identifier);

      if (result.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setError(result.message);
      }
    } catch (err: unknown) {
      setStatus("error");
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <Card className="w-full max-w-xs p-2 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Join the Beta!</CardTitle>
        <CardDescription>
          Sign up below to be notified when we launch our public beta!
        </CardDescription>
      </CardHeader>
      <CardFooter className="w-full">
        {status === "success" ? (
          <div className="flex items-center text-green-600">
            <Check className="mr-2 h-5 w-5" /> Thank you for joining the
            waitlist!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
            {error && (
              <p className="text-sm font-semibold text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              disabled={status === "loading" || isPending}
              className="flex items-center justify-center"
            >
              {status === "loading" || isPending
                ? "Submitting..."
                : "Join Waitlist"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
};