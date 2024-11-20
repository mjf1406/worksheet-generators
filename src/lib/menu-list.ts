// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  User,
  Settings,
  LayoutGrid,
  LucideIcon, 
  Dices,
  Shuffle,
  Clock,
  Text, 
  Newspaper, 
  Signpost,
  Dice5,
  BookKey,
  School,
  BrainCircuit,
  Hammer,
  ScreenShare,
  TvMinimal
} from "lucide-react";
import { AIBadge } from "~/components/AIBadge";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  under_construction: boolean;
  icon?: LucideIcon;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  under_construction: boolean;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

function sortByLabel<T extends { label: string }>(items: T[]): T[] {
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

export function getMenuList(pathname: string): Group[] {
  const unsortedMenuList: Group[] = [
    // {
    //   groupLabel: "",
    //   menus: [
    //     {
    //       href: "/dashboard",
    //       label: "Dashboard",
    //       active: pathname.includes("/dashboard"),
    //       icon: LayoutGrid,
    //       under_construction: true,
    //       submenus: []
    //     }
    //   ]
    // },
    {
      groupLabel: "",
      menus: [
        {
          href: "/classes",

          label: "My Classes",
          active: pathname.includes("/classes"),
          icon: School,
          under_construction: false,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/assigners",
          label: "Assigners",
          active: pathname.includes("/assigners"),
          icon: Signpost,
          under_construction: false,
          submenus: [ ]
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/generators",
          label: "Generators",
          active: pathname.includes("/generators"),
          icon: Dices,
          under_construction: false,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/screens",
          label: "Screens",
          active: pathname.includes("/screens"),
          icon: TvMinimal,
          under_construction: false,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/tools",
          label: "Tools",
          active: pathname.includes("/tools"),
          icon: Hammer,
          under_construction: false,
          submenus: []
        }
      ]
    },
  ];

  // Sort menus and submenus within each group
  const sortedMenuList = unsortedMenuList.map(group => ({
    ...group,
    menus: sortByLabel(group.menus.map(menu => ({
      ...menu,
      submenus: sortByLabel(menu.submenus)
    })))
  }));

  return sortedMenuList;
}
