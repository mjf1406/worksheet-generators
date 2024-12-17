import { ModeToggle } from "~/components/mode-toggle";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { APP_NAME } from "~/lib/constants";
import { Suspense } from "react";

export const metadata = {
  title: "Student Dashboard",
  description: "Your dashboard!",
};

function LoadingCard() {
  return (
    <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
  );
}

export default function StudentLayout({
  children,
  assignments,
  behaviors,
  points,
  reward_items,
}: {
  children: React.ReactNode;
  assignments?: React.ReactNode;
  behaviors?: React.ReactNode;
  points?: React.ReactNode;
  reward_items?: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="flex items-center justify-between bg-white p-5 dark:bg-black">
          <Link href="/" className="flex items-center gap-2">
            <Logo fill="hsl(var(--primary))" size="25" />
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {APP_NAME}
            </h1>
            <span className="ml-1 justify-start self-start text-xs text-orange-500">
              [ALPHA]
            </span>
          </Link>
          <ModeToggle />
        </header>

        <div className="h-full bg-accent/20 p-5 dark:bg-accent/10">
          {children}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* <Suspense fallback={<LoadingCard />}>{assignments}</Suspense>
            <Suspense fallback={<LoadingCard />}>{points}</Suspense>
            <Suspense fallback={<LoadingCard />}>{behaviors}</Suspense>
            <Suspense fallback={<LoadingCard />}>{reward_items}</Suspense> */}
          </div>
        </div>
      </body>
    </html>
  );
}
