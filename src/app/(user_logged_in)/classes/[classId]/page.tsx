"use client";

import { useCallback } from "react";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import Link from "next/link";
import { useToast } from "~/components/ui/use-toast";
import type { Student } from "~/server/db/types";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "./columns";
import AddGroupDialog from "../components/AddGroupDialog";
import ClassGroupsComponent from "../components/ClassGroups";
import { AddStudentsDialog } from "../components/AddStudents";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";

interface Params {
  classId: string;
}

export default function ClassDetails({ params }: { params: Params }) {
  const classId = params.classId;
  const { toast } = useToast();

  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);

  // Find the specific course data based on classId
  const courseData = coursesData.find((course) => course.class_id === classId);

  const handleStudentsAdded = useCallback(
    (newStudents: Student[]) => {
      // Note: You might need to update this logic depending on how you want to handle state updates
      // This example assumes you'll refetch the data after adding students
      toast({
        title: "Success",
        description: `Added ${newStudents.length} new student(s)`,
      });
    },
    [toast],
  );

  if (!courseData) {
    return (
      <ContentLayout title="Error">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/classes">My Classes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Error</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl">Error retrieving student roster</h1>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={courseData.class_name ? courseData.class_name : ""}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/classes">My Classes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.class_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="container flex flex-col items-center gap-4 px-4 py-16">
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full gap-5">
            <h2 className="text-2xl">Students</h2>
            <div className="flex flex-row items-center justify-center gap-2">
              <AddStudentsDialog
                classId={classId}
                existingStudents={courseData.students as unknown as Student[]}
                onStudentsAdded={handleStudentsAdded}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={courseData.students}
            key={courseData?.students?.length}
          />
          <div className="flex w-full items-center gap-5">
            <h2 className="self-start text-2xl">Groups</h2>
            <div className="flex flex-row items-center justify-center gap-2 self-end">
              <AddGroupDialog students={courseData.students} />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-4 text-sm">
            <ClassGroupsComponent class={courseData} />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
