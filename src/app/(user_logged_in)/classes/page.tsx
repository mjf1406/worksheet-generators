"use client";

import NewClassDialog from "./components/NewClassDialog";
import ClassList from "./components/ClassList";
import Link from "next/link";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import addDemoClasses from "~/server/actions/addDemoClasses";
import { Loader2 } from "lucide-react";

export default function MyClassesPage() {
  const [isLoading, setLoading] = useState(false);

  async function addDemos() {
    setLoading(true);
    await addDemoClasses();
    window.location.reload();
    setLoading(false);
  }

  return (
    <ContentLayout title="My Classes">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Classes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-5 flex flex-col items-center justify-center gap-10">
        <div className="flex gap-5">
          <NewClassDialog />
          <Button variant={"secondary"} disabled={true} onClick={addDemos}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Adding classes...
              </>
            ) : (
              // <>Add demo classes</> // don't forget to change disabled to isLoading
              <>Coming soon...</>
            )}
          </Button>
        </div>
        <ClassList />
      </div>
    </ContentLayout>
  );
}
