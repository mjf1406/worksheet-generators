"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import AssignerDialog from "../components/CreateAssignerDialog";
import AssignerSelect from "../components/AssignerSelect";
import ClassSelect from "~/app/(user_logged_in)/classes/components/ClassesSelect";
import GroupsSelect from "~/app/(user_logged_in)/classes/components/GroupsSelect";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "~/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { PDFGenerator, type AssignedData } from "../components/PDF";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";
import { CaseStudyCollapsible } from "./CaseStudy";
import { DescriptionCollapsible } from "./Description";
import { runSeatsAssigner } from "./utils";
import PlaceholderContent from "~/components/demo/placeholder-content";

const runAssignerSchema = z.object({
  assignerId: z.string().min(1, "Assigner is required"),
  classId: z.string().min(1, "Class is required"),
  selectedGroups: z.array(z.string()),
});

type RunAssignerFormData = z.infer<typeof runAssignerSchema>;

type AssignerResult = {
  success: boolean;
  data?: AssignedData;
  message?: string;
};

export default function SeatsClient() {
  return <PlaceholderContent />;
}
