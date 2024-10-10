"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import type { Group } from "~/server/db/types";
import StudentGrid from "../components/StudentGrid";

interface Params {
  classId: string;
  groupId: string;
}

export default function ClassDetails({ params }: { params: Params }) {
  const classId = params.classId;
  const groupId = params.groupId;

  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);

  const Data = coursesData.find((course) => course.class_id === classId);
  const courseData: Group | undefined = Data?.groups?.find(
    (group) => group.group_id === groupId,
  );

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
    <ContentLayout title={courseData.group_name ?? ""}>
      <div className="container flex flex-col items-center gap-4 px-4 py-16">
        <div className="flex w-full flex-col gap-4">
          {courseData.students && (
            <StudentGrid students={courseData.students} classId={classId} />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
