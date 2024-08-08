import Link from "next/link";

import PlaceholderContent from "~/components/demo/placeholder-content";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export default function RandomizerPage() {
  return (
    <ContentLayout title="Randomizer">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Randomizer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-5 flex w-full flex-col items-center justify-center gap-4">
        <p>
          Looking for a way to omit students/groups/classes that have already
          been picked? Use{" "}
          <Link className="underline" href={"/shuffler"}>
            Shuffler
          </Link>
          .
        </p>
      </div>
      <PlaceholderContent />
    </ContentLayout>
  );
}
