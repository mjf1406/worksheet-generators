"use client";

import * as React from "react";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { Loader2, User } from "lucide-react";

import { ModeToggle } from "~/components/theme/theme-toggle";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  NavigationMenu,
  NavigationMenuLink,
} from "~/components/ui/navigation-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import { Skeleton } from "~/components/ui/skeleton";
import { type NavProps } from "./TopNav";
import { APP_NAME } from "~/lib/constants";

const DesktopNav: React.FC<NavProps> = ({ page, course, student }) => {
  const { isSignedIn } = useAuth();
  const { loaded } = useClerk();
  const [loading, setLoading] = React.useState(true);

  const [isLoading, loadingSignIn] = React.useState(false);
  const [isLoadingClasses, loadingClasses] = React.useState(false);

  const handleMyClassesClick = () => {
    loadingClasses(true);
  };

  const handleClick = () => {
    loadingSignIn(true);
  };

  React.useEffect(() => {
    if (loaded) {
      setLoading(false);
    }
  }, [loaded]);

  return (
    <div className="border-accent bg-background sticky top-0 m-auto flex w-full items-center justify-between border-b">
      <div className="m-auto grid h-14 w-full max-w-5xl grid-cols-3 items-center justify-between px-4 md:px-6">
        <div className="flex-1 items-center justify-start">
          {page === "/" ? (
            <Link className="flex gap-2 font-semibold" href="#hero">
              <Logo fill="hsl(var(--primary))" size="30" />
              <div className="hidden flex-row gap-1 text-2xl md:flex">
                <div>{APP_NAME}</div>
                <div className="text-top justify-start self-start text-xs">
                  [BETA]
                </div>
              </div>
            </Link>
          ) : (
            <Link className="flex flex-row gap-2 font-semibold" href="/">
              <Logo fill="hsl(var(--primary))" size="30" />
              <div className="hidden flex-row gap-1 text-2xl md:flex">
                <div>Reparper</div>
                <div className="text-top justify-start self-start text-xs">
                  [BETA]
                </div>
              </div>
            </Link>
          )}
        </div>
        <div className="flex-1 items-center justify-center">
          {page === "/" || page === "/classes" ? (
            <NavigationMenu className="m-auto flex flex-row items-center justify-center"></NavigationMenu>
          ) : (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/classes">Classes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link
                    href={{
                      pathname: `/classes/${course?.class_id}`,
                      query: {
                        class_name: course?.class_name,
                      },
                    }}
                  >
                    {course?.class_name}
                  </Link>
                </BreadcrumbItem>
                {student?.student_name ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <Link
                        href={{
                          pathname: `/students/${student?.student_id}/report`,
                          query: {
                            student: JSON.stringify(student),
                            class_name: course?.class_name,
                            class_id: course?.class_id,
                          },
                        }}
                      >
                        {student?.student_name}
                      </Link>
                    </BreadcrumbItem>
                  </>
                ) : (
                  ""
                )}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          {!isSignedIn ? (
            <SignedOut>
              <div>
                {isLoading ? (
                  <Button
                    disabled={true}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </Button>
                ) : (
                  <Button asChild onClick={handleClick}>
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                )}
              </div>
            </SignedOut>
          ) : loaded ? (
            <div>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          ) : (
            <div>
              <Skeleton className="flex h-[30px] w-[30px] items-center justify-center rounded-full">
                <User></User>
              </Skeleton>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
export default DesktopNav;
