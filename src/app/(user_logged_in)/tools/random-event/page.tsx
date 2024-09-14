import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import PlaceholderContent from "~/components/demo/placeholder-content";

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
        <div className="mt-5 flex w-full flex-col items-center justify-center gap-4"></div>
        <PlaceholderContent />
      </ContentLayout>
    </HydrationBoundary>
  );
}
