"use client";

import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { ArrowRight, Menu } from "lucide-react";
import NavLogo from "./NavLogo";

const MainNav = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { title: "Features", href: "#features" },
    { title: "Pricing", href: "#pricing" },
    { title: "FAQ", href: "#faq" },
    { title: "Classes", href: "/classes" },
  ];

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
                {item.title === "Classes" && (
                  <ArrowRight className="ml-0.5 inline-block h-5 w-5" />
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );

  return (
    <header className="sticky top-0 z-20 w-full border-b border-accent bg-background">
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
                <nav className="flex flex-col space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="flex w-full items-center text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                      {item.title === "Classes" && (
                        <ArrowRight className="ml-2 inline-block h-4 w-4" />
                      )}
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
