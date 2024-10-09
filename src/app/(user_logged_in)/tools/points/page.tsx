import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
// import PointsClient from "./PointsClient";
import { Suspense } from "react";
import LoadingPage from "~/components/Loading";
import {
  behaviorsOptions,
  classesOptions,
  rewardItemsOptions,
} from "~/app/api/queryOptions";

export default async function PointsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(behaviorsOptions);
  await queryClient.prefetchQuery(classesOptions);
  await queryClient.prefetchQuery(rewardItemsOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Points">
        <Suspense fallback={<LoadingPage />}>{/* <PointsClient /> */}</Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
