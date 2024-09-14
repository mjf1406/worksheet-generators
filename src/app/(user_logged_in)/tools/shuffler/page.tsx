import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import fetchClassesGroupsStudents from "~/app/api/fetches";
import Shuffler from "./Shuffler";

export default async function ShufflerPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  /*
    User needs to be able to shuffle -- while ensuring all 
    items go first and last before anyone can go first and last again -- ...
      - classes
      - selected groups within a specified class
      - selected students from within a specified group
      - selected students from within a specified class
  */

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Shuffler">
        <Shuffler />
      </ContentLayout>
    </HydrationBoundary>
  );
}
