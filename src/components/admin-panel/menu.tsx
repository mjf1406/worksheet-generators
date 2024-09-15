"use client";

import Link from "next/link";
import { Ellipsis, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";
import { getMenuList } from "~/lib/menu-list";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { CollapseMenuButton } from "~/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  return (
    <ScrollArea className="overflow-hidden [&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px-8px-4rem)] flex-col items-start px-2 lg:min-h-[calc(100vh-32px-40px-32px-8px)]">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {((isOpen && groupLabel) ?? isOpen === undefined) ? (
                <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-1"></p>
              )}
              {menus.map(
                (
                  {
                    href,
                    label,
                    icon: Icon,
                    active,
                    submenus,
                    under_construction,
                  },
                  index,
                ) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className="h-10 w-full justify-start"
                              asChild
                            >
                              <Link
                                href={href}
                                className={
                                  under_construction ? "opacity-40" : ""
                                }
                              >
                                <span
                                  className={cn(isOpen === false ? "" : "mr-4")}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100",
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  ),
              )}
            </li>
          ))}
          <li className="flex w-full grow flex-col items-center justify-end gap-4">
            <Separator />
            {isOpen ? (
              <div className="flex w-full items-center justify-center gap-2">
                <div className="col-span-1">
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
                <div>
                  <Button
                    asChild
                    variant={"outline"}
                    className="h-8 w-8 rounded-full"
                    size={"icon"}
                  >
                    <Link href={"/settings"}>
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="col-span-1">
                  <ModeToggle />
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-3">
                <div className="col-span-1">
                  <ModeToggle />
                </div>
                <div>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant={"outline"}
                          className="h-8 w-8 rounded-full"
                          size={"icon"}
                        >
                          <Link href={"/settings"}>
                            <Settings className="h-5 w-5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side={isOpen ? "top" : "right"}>
                        Settings
                      </TooltipContent>
                      {/* {isOpen ? (
                        <TooltipContent side="top">Settings</TooltipContent>
                      ) : (
                        <TooltipContent side="right">Settings</TooltipContent>
                      )} */}
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-1">
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
