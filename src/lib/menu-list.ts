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
<<<<<<< HEAD
  School,
  Dice5,
  BookKey,
  Construction
=======
  School
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
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
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          under_construction: true,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/classes",
<<<<<<< HEAD
          label: "My Classes",
          active: pathname.includes("/classes"),
          icon: School,
          under_construction: false,
=======
          label: "Classes",
          active: pathname.includes("/classes"),
          icon: School,
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
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
<<<<<<< HEAD
          under_construction: false,
          submenus: []
        },
        {
          href: "/random-event",
          label: "Random Event",
          active: pathname.includes("/random-event"),
          icon: Dice5,
          under_construction: false,
          submenus: []
        },
        {
          href: "/fact-of-the-day",
          label: "Fact of the Day",
          active: pathname.includes("/fact-of-the-day"),
          icon: BookKey,
          under_construction: true,
          submenus: []
        },
        {
=======
          submenus: []
        },
        {
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          href: "/randomizer",
          label: "Randomizer",
          active: pathname.includes("/randomizer"),
          icon: Dices,
<<<<<<< HEAD
          under_construction: false,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/shuffler",
          label: "Shuffler",
          active: pathname.includes("/shuffler"),
          icon: Shuffle,
<<<<<<< HEAD
          under_construction: false,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/classroom-clock",
          label: "Classroom Clock",
          active: pathname.includes("/classroom-clock"),
          icon: Clock,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/reading-passage",
          label: "Reading Passage",
          active: pathname.includes("/reading-passage"),
          icon: Text,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
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
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/crossword",
          label: "Crossword",
          active: pathname.includes("/crossword"),
          icon: Newspaper,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/scramble",
          label: "Scramble",
          active: pathname.includes("/scramble"),
          icon: Newspaper,
<<<<<<< HEAD
          under_construction: false,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/cloze",
          label: "Cloze",
          active: pathname.includes("/cloze"),
          icon: Newspaper,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/vocabulary-hunt",
          label: "Vocabulary Hunt",
          active: pathname.includes("/vocabulary-hunt"),
          icon: Newspaper,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/custom",
          label: "Custom",
          active: pathname.includes("/custom"),
          icon: Newspaper,
<<<<<<< HEAD
          under_construction: true,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
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
<<<<<<< HEAD
          under_construction: false,
=======
>>>>>>> e0d6f1092b8b20146b15935eeb157bf2d8626001
          submenus: []
        },
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
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

// export function getMenuList(pathname: string): Group[] {
//   return [
    
//   ];
// }
