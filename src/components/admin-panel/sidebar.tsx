import Link from "next/link";

import { cn } from "~/lib/utils";
import { useStore } from "~/hooks/use-store";
import { Button } from "~/components/ui/button";
import { Menu } from "~/components/admin-panel/menu";
import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { SidebarToggle } from "~/components/admin-panel/sidebar-toggle";
import { APP_NAME } from "~/lib/constants";
import Logo from "../brand/Logo";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72",
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "mb-1 transition-transform duration-300 ease-in-out",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            {sidebar.isOpen ? (
              <>
                <Logo fill="hsl(var(--primary))" size="25" />
                <h1
                  className={cn(
                    "whitespace-nowrap text-lg font-bold transition-[transform,opacity,display] duration-300 ease-in-out",
                  )}
                >
                  {APP_NAME}
                </h1>
                <div className="text-top -ml-1 justify-start self-start text-xs">
                  [ALPHA]
                </div>
              </>
            ) : (
              <Logo fill="hsl(var(--primary))" size="25" />
            )}
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
