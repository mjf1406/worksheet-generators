import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import RoundRobinClient from "./RoundRobinClient";
import { Suspense } from "react";
import LoadingPage from "~/components/Loading";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";

export default async function RoundRobinPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(assignerOptions);
  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Round-Robin Assigner">
        <Suspense fallback={<LoadingPage />}>
          <RoundRobinClient />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
