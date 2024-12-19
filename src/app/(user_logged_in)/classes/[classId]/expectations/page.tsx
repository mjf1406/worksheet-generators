"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CreateExpectationDialog } from "./components/CreateExpectationDialog";

// Import shadcn UI components
import StudentsExpectationsTable from "./components/StudentsExpectationsTable";

interface Params {
  classId: string;
}

export default function Expectations({ params }: { params: Params }) {
  const classId = params.classId;
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);
  const courseData = coursesData.find((course) => course.class_id === classId);

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">
            Error retrieving class data. Please refresh the page to try again.
          </h1>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Expectations">
      <div className="container flex flex-col items-center gap-4 px-4 py-4">
        <div className="flex w-full flex-col gap-4">
          <div className="semi-bold flex w-full items-center justify-between gap-2 self-start text-left text-3xl">
            <div className="flex items-center justify-center gap-2">
              <Link
                className="font-extrabold text-primary hover:underline"
                href={`/classes/${classId}`}
              >
                {courseData.class_name}
              </Link>
              <ChevronRight />
              Expectations
            </div>
            <CreateExpectationDialog classId={classId} />
          </div>
          <StudentsExpectationsTable courseData={courseData} />
        </div>
      </div>
    </ContentLayout>
  );
}
