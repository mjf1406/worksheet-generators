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
  School
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon
  submenus: Submenu[];
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
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/classes",
          label: "Classes",
          active: pathname.includes("/classes"),
          icon: School,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Tools",
      menus: [
        {
          href: "/assigner",
          label: "Assigner",
          active: pathname.includes("/assigner"),
          icon: Signpost,
          submenus: []
        },
        {
          href: "/randomizer",
          label: "Randomizer",
          active: pathname.includes("/randomizer"),
          icon: Dices,
          submenus: []
        },
        {
          href: "/shuffler",
          label: "Shuffler",
          active: pathname.includes("/shuffler"),
          icon: Shuffle,
          submenus: []
        },
        {
          href: "/classroom-clock",
          label: "Classroom Clock",
          active: pathname.includes("/classroom-clock"),
          icon: Clock,
          submenus: []
        },
        {
          href: "/reading-passage",
          label: "Reading Passage",
          active: pathname.includes("/reading-passage"),
          icon: Text,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Worksheet Generators",
      menus: [
        {
          href: "/word-search",
          label: "Word Search",
          active: pathname.includes("/word-search"),
          icon: Newspaper,
          submenus: []
        },
        {
          href: "/crossword",
          label: "Crossword",
          active: pathname.includes("/crossword"),
          icon: Newspaper,
          submenus: []
        },
        {
          href: "/scramble",
          label: "Scramble",
          active: pathname.includes("/scramble"),
          icon: Newspaper,
          submenus: []
        },
        {
          href: "/cloze",
          label: "Cloze",
          active: pathname.includes("/cloze"),
          icon: Newspaper,
          submenus: []
        },
        {
          href: "/vocabulary-hunt",
          label: "Vocabulary Hunt",
          active: pathname.includes("/vocabulary-hunt"),
          icon: Newspaper,
          submenus: []
        },
        {
          href: "/custom",
          label: "Custom",
          active: pathname.includes("/custom"),
          icon: Newspaper,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "User",
      menus: [
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: User,
          submenus: []
        },
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
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

// export function getMenuList(pathname: string): Group[] {
//   return [
    
//   ];
// }
