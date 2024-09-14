import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";
import LoadingPage from "~/components/Loading";
import ItemGrid from "~/components/ItemGrid";
import { assignersData } from "~/lib/constants";

export default async function AssignerPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(assignerOptions);
  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Assigners">
        <Suspense fallback={<LoadingPage />}>
          <ItemGrid data={assignersData} />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
