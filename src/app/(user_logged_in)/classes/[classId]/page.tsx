"use client";

import React, { useEffect, useState } from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import StudentGrid from "./components/StudentGrid";
import ClassGroupsComponent from "../components/ClassGroups";
import { TeacherCourse } from "~/server/db/types";

interface Params {
  classId: string;
}

export default function ClassDetails({ params }: { params: Params }) {
  const classId = params.classId;

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
      <div className="container flex flex-col items-center gap-4 px-4 py-4 lg:py-16">
        <div className="flex w-full flex-col gap-4">
          <ClassGroupsComponent class={courseData} />
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
