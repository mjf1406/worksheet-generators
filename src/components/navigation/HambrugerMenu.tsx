"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { Menu } from "lucide-react";

export function HamburgerMenu() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="w-fit">
          <Menu />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Window</MenubarItem>
          <MenubarItem>Share</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
