"use client";

import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Menu } from "lucide-react";
import UserAndTheme from "./UserAndTheme";
import NavLogo from "./NavLogo";

const MainNav = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [{ title: "Dashboard", href: "/dashboard" }];

  const NavigationMenuDemo = () => (
    <>
      <NavigationMenu>
        <NavigationMenuList className="space-x-4">
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink
                href={item.href}
                className="rounded-xl px-2 py-1.5 hover:bg-secondary"
              >
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          <UserAndTheme />
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );

  return (
    <header className="sticky top-0 z-20 w-full border-b border-accent bg-background">
      {/* <header className="fixed bottom-0 z-20 w-full border-t border-accent bg-background md:sticky md:bottom-0 lg:top-0 lg:border-b lg:border-t-0"> */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-4">
          <NavLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenuDemo />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="mb-3 flex items-start">
                  <UserAndTheme />
                </div>
                <nav className="flex flex-col space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainNav;
