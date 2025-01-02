"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import StudentGrid from "./components/StudentGrid";
import ClassGroupsComponent from "../components/ClassGroups";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  CircleCheckBig,
  HelpCircle,
  LayoutDashboard,
  NotebookPen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { dmMono } from "~/app/fonts";
import { useToast } from "~/components/ui/use-toast";
import ClassCodeDisplay from "../components/ClassCode";

interface Params {
  classId: string;
}

export default function ClassDetails({ params }: { params: Params }) {
  const classId = params.classId;
  const { toast } = useToast();

  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);

  const courseData = coursesData.find((course) => course.class_id === classId);

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">Error retrieving student roster</h1>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={courseData.class_name ?? ""}>
      <div className="container flex flex-col items-center gap-4 px-4 py-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="w-fit">
              <Link href={`/classes/${courseData.class_id}/dashboard`}>
                <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-fit">
              <Link href={`/classes/${courseData.class_id}/tasks`}>
                <NotebookPen className="mr-2 h-5 w-5" /> Tasks
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-fit">
              <Link href={`/classes/${courseData.class_id}/expectations`}>
                <CircleCheckBig className="mr-2 h-5 w-5" /> Expectations
              </Link>
            </Button>
            <ClassCodeDisplay
              classCode={courseData.class_code}
              role={courseData.role}
            />
          </div>
          <ClassGroupsComponent class={courseData} />
          <div className="text-3xl">Students</div>
          {courseData.students && courseData.groups && (
            <StudentGrid
              students={courseData.students}
              groups={courseData.groups}
              classId={classId}
            />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
