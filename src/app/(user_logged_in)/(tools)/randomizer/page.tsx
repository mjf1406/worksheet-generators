import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import RandomizerClient from "./RandomizerClient"; // Adjust this import path as needed
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

export default async function RandomizerPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  /*
    User needs to be able to randomly select...
      - a class
      - a group within a specified class
      - a student within a specified group
      - a student within a specified class
  */

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Randomizer">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Randomizer</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <RandomizerClient />
      </ContentLayout>
    </HydrationBoundary>
  );
}
