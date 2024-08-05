"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
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
import type { Course, Student } from "~/server/db/types";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "./columns";
import AddGroupDialog from "./AddGroupDialog";
import ClassGroupsComponent from "../components/ClassGroups";

interface Params {
  classId: string;
}

async function fetchStudentRoster(
  classId: string,
  userId: string | null | undefined,
): Promise<Course | undefined> {
  try {
    const url = new URL("/api/getClass", window.location.origin);
    url.searchParams.append("classId", classId);
    url.searchParams.append("userId", String(userId));
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Failed to fetch student roster");
      throw new Error("Failed to fetch student roster");
    }
    const text: string = await response.text();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: Course | undefined = JSON.parse(text);
    return data;
  } catch (err) {
    const error = err as Error;
    console.error("failed to parse course", error);
    throw new Error("failed to parse course");
  }
}

export default function ClassDetails({ params }: { params: Params }) {
  const [course, setCourse] = useState<Course>();
  const [students, setStudents] = useState<Student[]>();
  const [isError, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const classId = params.classId;
  const { userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentRoster(classId, userId)
      .then((data) => {
        setCourse(data);
        setIsLoading(false);
      })
      .catch((err) => {
        const error = err as Error;
        setError(String(error));
        toast({
          title: "Error!",
          variant: "destructive",
          description: `${String(error)}`,
        });
      });
  }, [classId, userId, toast]);

  useEffect(() => {
    if (!isLoading && course?.students) {
      setStudents(course.students);
    }
  }, [isLoading, course]);

  if (!course) {
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
          {isLoading ? (
            <h1 className="flex flex-row gap-3 text-5xl">
              <Loader2 className="h-12 w-12 animate-spin" />
              <span>Loading...</span>
            </h1>
          ) : (
            <h1 className="text-5xl">Error retrieving student roster</h1>
          )}
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={course.class_name ? course.class_name : ""}>
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
            <BreadcrumbPage>{course.class_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="container flex flex-col items-center gap-4 px-4 py-16">
        {isLoading ? (
          <h1 className="flex flex-row gap-3 text-5xl">
            <Loader2 className="h-12 w-12 animate-spin" />
            <span>Loading...</span>
          </h1>
        ) : (
          <></>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex w-full gap-5">
            <h2 className="text-2xl">Students</h2>
            <div className="flex flex-row items-center justify-center gap-2">
              <Button>
                <Plus className="mr-2 h-6 w-6" /> Add student
              </Button>
            </div>
          </div>
          <DataTable columns={columns} data={course.students} />
          <div className="flex w-full items-center gap-5">
            <h2 className="self-start text-2xl">Groups</h2>
            <div className="flex flex-row items-center justify-center gap-2 self-end">
              <AddGroupDialog students={course.students} />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-4 text-sm">
            <ClassGroupsComponent course={course} />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
