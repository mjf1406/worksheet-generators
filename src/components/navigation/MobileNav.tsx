"use client";

import * as React from "react";
import Link from "next/link";
import Logo from "~/components/brand/Logo";
import { Loader2, User, Menu } from "lucide-react";

import { ModeToggle } from "~/components/theme/theme-toggle";
import { Button } from "~/components/ui/button";

import { NavigationMenu } from "~/components/ui/navigation-menu";
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

const MobileNav: React.FC<NavProps> = ({ page, course, student }) => {
  const { isSignedIn } = useAuth();
  const { loaded } = useClerk();
  const [loading, setLoading] = React.useState(true);
  const [isLoading, loadingSignIn] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
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
    <div>
      <div className="border-accent bg-background sticky top-0 m-auto flex w-full items-center justify-between border-b">
        <div className="m-auto grid h-14 w-full grid-cols-2 items-center justify-between px-4 md:px-6">
          <div className="flex flex-row items-center justify-start gap-2">
            <div>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-7 w-7"></Menu>
              </Button>
            </div>
            <div>
              {page === "/" ? (
                <Link className="flex gap-2 font-semibold" href="#hero">
                  <Logo fill="hsl(var(--primary))" size="30" />
                  <span className="hidden text-2xl md:block">Reparper</span>
                </Link>
              ) : (
                <Link className="flex gap-2 font-semibold" href="/">
                  <Logo fill="hsl(var(--primary))" size="30" />
                  <span className="hidden text-2xl md:block">Reparper</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center justify-end gap-4">
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
      <div
        className={`m-auto -mx-4 flex h-full w-full justify-self-start bg-[color:hsl(144,50%,86%)] dark:bg-[color:hsl(147,47%,9%)] ${
          isMenuOpen ? "fixed" : "hidden"
        }`}
      >
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
    </div>
  );
};
export default MobileNav;
