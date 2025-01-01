// components/BreadcrumbBuilder.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

// Import shadcn dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react"; // For dropdown icon
import { Badge } from "~/components/ui/badge"; // Import Badge component
import type { ItemGridData } from "./ItemGrid";
import {
  toolsData,
  assignersData,
  generatorsData,
  screensData,
} from "~/lib/constants";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions"; // Ensure students are part of classesData

export function BreadcrumbBuilder() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathSegments = pathname.split("/").filter(Boolean);
  const { data: coursesData = [] } = useSuspenseQuery(classesOptions);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    let displayName = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Check if this is a class segment
    if (segment.startsWith("class_")) {
      const classId = segment;
      const matchedCourse = coursesData.find(
        (course) => course.class_id === classId,
      );
      if (matchedCourse) {
        displayName = matchedCourse.class_name;
      }
    }

    // Check if this is a group segment
    if (segment.startsWith("group_")) {
      const groupId = segment;
      const matchedCourse = coursesData.find((course) =>
        course.groups?.some((group) => group.group_id === groupId),
      );
      if (matchedCourse) {
        const matchedGroup = matchedCourse.groups?.find(
          (group) => group.group_id === groupId,
        );
        if (matchedGroup) {
          displayName = matchedGroup.group_name;
        }
      }
    }

    // Check if this is a student segment
    if (segment.startsWith("student_")) {
      const studentId = segment;
      // Traverse coursesData to find the student
      let matchedStudentName = null;

      for (const course of coursesData) {
        // Assuming students are nested within groups or directly under course
        // Adjust the traversal based on your actual data structure
        if (course.students) {
          const student = course.students.find(
            (s) => s.student_id === studentId,
          );
          if (student) {
            matchedStudentName = student.student_name_first_en;
            break;
          }
        }

        if (course.groups) {
          for (const group of course.groups) {
            if (group.students) {
              const student = group.students.find(
                (s) => s.student_id === studentId,
              );
              if (student) {
                matchedStudentName = student.student_name_first_en;
                break;
              }
            }
          }
          if (matchedStudentName) break;
        }
      }

      if (matchedStudentName) {
        displayName = matchedStudentName;
      } else {
        // Optionally, handle fallback if student not found
        displayName = "Student";
      }
    }

    const shouldHaveDropdown =
      !isLast && hasDataForSegment(segment) && pathSegments.length > index + 1;

    if (isLast) {
      return (
        <BreadcrumbItem key={href}>
          <BreadcrumbPage>{displayName}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    } else if (shouldHaveDropdown) {
      const dropdownData = getDataForSegment(segment);
      return (
        <React.Fragment key={href}>
          <BreadcrumbItem>
            <DropdownBreadcrumbLink
              href={href}
              displayName={displayName}
              dropdownData={dropdownData}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment key={href}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={href}>{displayName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </React.Fragment>
      );
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator />}
        {breadcrumbItems}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to determine if a segment has data
function hasDataForSegment(segment: string) {
  return segmentDataMap.hasOwnProperty(segment.toLowerCase());
}

// Helper function to get data for a segment
function getDataForSegment(segment: string) {
  return segmentDataMap[segment.toLowerCase()] ?? [];
}

// Map segment names to their data
const segmentDataMap: Record<string, ItemGridData[]> = {
  tools: toolsData,
  assigners: assignersData,
  generators: generatorsData,
  screens: screensData,
};

// Component for breadcrumb link with dropdown
function DropdownBreadcrumbLink({
  href,
  displayName,
  dropdownData,
}: {
  href: string;
  displayName: string;
  dropdownData: ItemGridData[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BreadcrumbLink asChild>
          <Link href={href}>
            {displayName} <ChevronDown className="inline-block h-4 w-4" />
          </Link>
        </BreadcrumbLink>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {dropdownData.map((item) => {
          const isUnderConstruction = item.under_construction;
          const ItemIcon = item.icon;
          const itemBadge = item.badge;

          return (
            <DropdownMenuItem
              key={item.href}
              className={`flex items-center ${
                isUnderConstruction ? "cursor-not-allowed opacity-50" : ""
              }`}
              asChild={!isUnderConstruction}
            >
              {isUnderConstruction ? (
                <div
                  className="flex w-full items-center"
                  tabIndex={-1}
                  aria-disabled="true"
                >
                  <ItemIcon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  <div className="ml-auto flex items-center space-x-2">
                    {itemBadge && (
                      <Badge variant="secondary">{itemBadge}</Badge>
                    )}
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              ) : (
                <Link href={item.href} className="flex w-full items-center">
                  <ItemIcon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  {itemBadge && (
                    <Badge className="ml-auto" variant="secondary">
                      {itemBadge}
                    </Badge>
                  )}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
