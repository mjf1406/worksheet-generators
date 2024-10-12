import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import RandomEventClient from "./RandomEventClient";

export default async function RandomEventPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Randomizer">
        <RandomEventClient />
      </ContentLayout>
    </HydrationBoundary>
  );
}
