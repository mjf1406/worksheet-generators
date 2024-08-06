import Link from "next/link";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export default function RandomAssignerPage() {
  return (
    <ContentLayout title="Assigner">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Assigner</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-5">
        <p className="max-w-xl">
          You can use this to assign permanent or semi-permeate things to your
          students in your classroom, such as Chromebooks or jobs. I, for
          example, use it to randomly assign Chromebooks to my students based on
          their groups because I have 14 Chromebooks, but 28 students, and I
          only teach 14 students at a time. So, every time their groups change,
          I run the Chromebook assigner.
        </p>
      </div>
    </ContentLayout>
  );
}
