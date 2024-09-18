import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import ShufflerClient from "./Shuffler";

export default async function ShufflerPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Shuffler">
        <ShufflerClient />
      </ContentLayout>
    </HydrationBoundary>
  );
}
