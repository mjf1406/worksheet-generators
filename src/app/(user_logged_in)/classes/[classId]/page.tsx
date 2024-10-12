"use client";

import React from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import StudentGrid from "./components/StudentGrid";

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
          <div className="text-3xl">Groups</div>
          <div className="grid grid-cols-3 gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            {courseData.groups?.map((group) => (
              <Link
                key={group.group_id}
                href={{
                  pathname: `/classes/${classId}/${group.group_id}`,
                }}
              >
                <Card className="relative col-span-1 cursor-pointer">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-center text-base md:text-xl">
                      {group.group_name}
                    </CardTitle>
                    <CardDescription></CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm">
                    <p>
                      <b>Students:</b> {group.students.length ?? 0}
                    </p>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
              </Link>
            ))}
          </div>
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
