import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
// import PointsClient from "./PointsClient";
import { Suspense } from "react";
import LoadingPage from "~/components/Loading";
import { classesOptions } from "~/app/api/queryOptions";

export default async function ToolsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Points">
        <Suspense fallback={<LoadingPage />}>{/* <PointsClient /> */}</Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
