"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import CreateAssignmentsDialog from "./components/CreateAssignmentDialog";
import CreateTopicDialog from "./components/CreateTopicDialog";
import { Topic } from "~/server/db/types";
import AssignmentsTable from "./components/AssignmentsTable";

interface Params {
  classId: string;
}

export default function Assignments({ params }: { params: Params }) {
  const classId = params.classId;

  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);

  const courseData = coursesData.find((course) => course.class_id === classId);

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">Error retrieving assignments.</h1>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={courseData.class_name ?? ""}>
      <div className="container flex flex-col items-center gap-4 px-4 py-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex gap-5">
            <div className="semi-bold flex items-center justify-center gap-2 self-start text-left text-3xl">
              <Link
                className="font-extrabold text-primary hover:underline"
                href={`/classes/${courseData?.class_id}`}
              >
                {courseData?.class_name}
              </Link>
              <ChevronRight />
              Assignments
            </div>
            <CreateAssignmentsDialog topics={courseData.topics ?? []} />
            <CreateTopicDialog />
          </div>
          <AssignmentsTable params={{ classId: classId }} />
        </div>
      </div>
    </ContentLayout>
  );
}
