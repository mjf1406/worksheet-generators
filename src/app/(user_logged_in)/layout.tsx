"use client";

import { usePathname } from "next/navigation"; // for app router
import AdminPanelLayout from "~/components/admin-panel/admin-panel-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // List of paths to exclude from the layout
  const excludePaths = ["/students"]; // make sure to match the full path, not a segment

  if (excludePaths.some((path) => pathname?.includes(path))) {
    return <>{children}</>;
  }

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
