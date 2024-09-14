import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import { Suspense } from "react";
import LoadingPage from "~/components/Loading";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";
import SeatsClient from "./SeatsClient";

export default async function SeatsAssignerPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(assignerOptions);
  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Seats Assigner">
        <Suspense fallback={<LoadingPage />}>
          <SeatsClient />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
