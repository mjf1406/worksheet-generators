"use client";

import React, { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";

type ButtonVariant =
  | "link"
  | "outline"
  | "default"
  | "destructive"
  | "secondary"
  | "ghost";

interface PricingPlan {
  title: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: ButtonVariant;
  recommended?: boolean;
}

const pricingData: PricingPlan[] = [
  {
    title: "Free",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    description: "Forever free",
    features: ["classes", "AI Tools ()"],
    buttonText: "Sign up",
    buttonVariant: "outline",
  },
  {
    title: "Basic",
    monthlyPrice: "$",
    yearlyPrice: "$",
    description: "All the basics",
    features: ["classes", "AI Tools ()"],
    buttonText: "Sign up",
    buttonVariant: "default",
    recommended: true,
  },
  {
    title: "Pro",
    monthlyPrice: "$",
    yearlyPrice: "$",
    description: "More of everything",
    features: ["classes", "AI Tools ()"],
    buttonText: "Sign up",
    buttonVariant: "outline",
  },
  {
    title: "District",
    monthlyPrice: "COMING SOON",
    yearlyPrice: "COMING SOON",
    description: "per user",
    features: ["Unlimited users", "Unlimited classes", "AI Tools ()"],
    buttonText: "Sign up",
    buttonVariant: "outline",
  },
];

export default function PricingCardGrid() {
  const [isYearly, setIsYearly] = useState(false);

  const handleFrequencyChange = () => {
    setIsYearly(!isYearly);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <Label htmlFor="payment-schedule" className="me-3">
          Monthly
        </Label>
        <Switch
          id="payment-schedule"
          checked={isYearly}
          onCheckedChange={handleFrequencyChange}
        />
        <Label htmlFor="payment-schedule" className="relative ms-3">
          Annual
          <span className="absolute -end-28 -top-10 start-auto">
            <span className="flex items-center">
              <svg
                className="-me-6 h-8 w-14"
                width={45}
                height={25}
                viewBox="0 0 45 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M43.2951 3.47877C43.8357 3.59191 44.3656 3.24541 44.4788 2.70484C44.5919 2.16427 44.2454 1.63433 43.7049 1.52119L43.2951 3.47877ZM4.63031 24.4936C4.90293 24.9739 5.51329 25.1423 5.99361 24.8697L13.8208 20.4272C14.3011 20.1546 14.4695 19.5443 14.1969 19.0639C13.9242 18.5836 13.3139 18.4152 12.8336 18.6879L5.87608 22.6367L1.92723 15.6792C1.65462 15.1989 1.04426 15.0305 0.563943 15.3031C0.0836291 15.5757 -0.0847477 16.1861 0.187863 16.6664L4.63031 24.4936ZM43.7049 1.52119C32.7389 -0.77401 23.9595 0.99522 17.3905 5.28788C10.8356 9.57127 6.58742 16.2977 4.53601 23.7341L6.46399 24.2659C8.41258 17.2023 12.4144 10.9287 18.4845 6.96211C24.5405 3.00476 32.7611 1.27399 43.2951 3.47877L43.7049 1.52119Z"
                  fill="currentColor"
                  className="text-muted-foreground"
                />
              </svg>
              <Badge className="mt-3 uppercase">Save up to 10%</Badge>
            </span>
          </span>
        </Label>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        {pricingData.map((plan, index) => (
          <Card
            key={index}
            className={plan.recommended ? "border-primary" : ""}
          >
            <CardHeader className="pb-2 text-center">
              {plan.recommended && (
                <Badge className="mb-3 w-max self-center uppercase">
                  Recommended
                </Badge>
              )}
              <CardTitle className="mb-7">{plan.title}</CardTitle>
              <span className="text-5xl font-bold">
                {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
              </span>
            </CardHeader>
            <CardDescription className="mx-auto w-11/12 text-center">
              {plan.description}
            </CardDescription>
            <CardContent>
              <ul className="mt-7 space-y-2.5 text-sm">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex space-x-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.buttonVariant}>
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
