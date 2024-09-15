import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import RandomEventClient from "./RandomEventClient";
import LoadingPage from "~/components/Loading";
import { Suspense } from "react";

async function getClasses() {
  const res = await fetch("/api/getClasses");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
}

export default async function ShufflerPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Random Event">
        <Suspense fallback={<LoadingPage />}>
          <RandomEventClient />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
