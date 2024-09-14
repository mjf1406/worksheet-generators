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
import { generatorsData } from "~/lib/constants";

export default async function GeneratorsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(classesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Generators">
        <Suspense fallback={<LoadingPage />}>
          <ItemGrid data={generatorsData} />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
