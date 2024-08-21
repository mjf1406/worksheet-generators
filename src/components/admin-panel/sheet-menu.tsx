import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Menu } from "~/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { APP_NAME } from "~/lib/constants";
import Logo from "../brand/Logo";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button
            className="flex items-center justify-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Logo fill="hsl(var(--primary))" size="25" />
              <h1 className="text-lg font-bold">{APP_NAME}</h1>
              <div className="text-top -ml-1 justify-start self-start text-xs">
                [ALPHA]
              </div>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
