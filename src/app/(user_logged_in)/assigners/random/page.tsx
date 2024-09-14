import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import RandomAssignerClient from "./RandomClient";
import { Suspense } from "react";
import LoadingPage from "~/components/Loading";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";

export default async function RandomAssignerPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(assignerOptions);
  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Random Assigner">
        <Suspense fallback={<LoadingPage />}>
          <RandomAssignerClient />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
