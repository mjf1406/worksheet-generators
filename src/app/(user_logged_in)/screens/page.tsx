import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { classesOptions } from "~/app/api/queryOptions";
import LoadingPage from "~/components/Loading";
import ItemGrid from "~/components/ItemGrid";
import { screensData } from "~/lib/constants";

export default async function ScreensPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Screens">
        <Suspense fallback={<LoadingPage />}>
          <ItemGrid data={screensData} />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
