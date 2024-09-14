import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import RandomizerClient from "./RandomizerClient"; // Adjust this import path as needed
import { ContentLayout } from "~/components/admin-panel/content-layout";

export default async function RandomizerPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Randomizer">
        <RandomizerClient />
      </ContentLayout>
    </HydrationBoundary>
  );
}
