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
  BrainCircuit
} from "lucide-react";
import { AIBadge } from "~/components/AIBadge";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  under_construction: boolean;
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
      groupLabel: "Tools",
      menus: [
        {
          href: "/tool/assigner",
          label: "Assigners",
          active: pathname.includes("/tool/assigner"),
          icon: Signpost,

          under_construction: false,
          submenus: [
            {
              href: "/tool/assigner/round-robin",
              label: "Round-Robin",
              active: pathname.includes("/tool/assigner/round-robin"),
              under_construction: false,
            },
            {
              href: "/tool/assigner/random",
              label: "Random",
              active: pathname.includes("/tool/assigner/random"),
              under_construction: false,
            },
            {
              href: "/tool/assigner/seats",
              label: "Seats",
              active: pathname.includes("/tool/assigner/seats"),
              under_construction: true,
            },
          ]
        },
        {
          href: "/tool/random-event",
          label: "Random Event",
          active: pathname.includes("/random-event"),
          icon: Dice5,
          under_construction: true,
          submenus: []
        },
        // {
        //   href: "/tool/fact-of-the-day",
        //   label: "Fact of the Day",
        //   active: pathname.includes("/fact-of-the-day"),
        //   icon: BookKey,
        //   under_construction: true,
        //   submenus: []
        // },
        {

          href: "/tool/randomizer",
          label: "Randomizer",
          active: pathname.includes("/randomizer"),
          icon: Dices,

          under_construction: false,


          submenus: []
        },
        {
          href: "/tool/shuffler",
          label: "Shuffler",
          active: pathname.includes("/shuffler"),
          icon: Shuffle,

          under_construction: false,


          submenus: []
        },
        {
          href: "/tool/classroom-clock",
          label: "Classroom Clock",
          active: pathname.includes("/classroom-clock"),
          icon: Clock,

          under_construction: true,


          submenus: []
        },
      ]
    },
    {
      groupLabel: "Worksheet Generators",
      menus: [
        {
          href: "/generator/word-search",
          label: "Word Search",
          active: pathname.includes("/word-search"),
          icon: Newspaper,

          under_construction: true,


          submenus: []
        },
        {
          href: "/generator/crossword",
          label: "Crossword",
          active: pathname.includes("/crossword"),
          icon: Newspaper,

          under_construction: true,


          submenus: []
        },
        {
          href: "/generator/reading-passage",
          label: "Reading Passage",
          active: pathname.includes("/reading-passage"),
          icon: BrainCircuit,
          under_construction: true,


          submenus: []
        },
        {
          href: "/generator/scramble",
          label: "Scramble",
          active: pathname.includes("/scramble"),
          icon: Newspaper,
          under_construction: true,
          submenus: []
        },
        {
          href: "/generator/cloze",
          label: "Cloze",
          active: pathname.includes("/cloze"),
          icon: BrainCircuit,
          under_construction: true,
          submenus: []
        },
        {
          href: "/generator/vocabulary-hunt",
          label: "Vocabulary Hunt",
          active: pathname.includes("/vocabulary-hunt"),
          icon: BrainCircuit,
          under_construction: true,
          submenus: []
        },
        {
          href: "/generator/custom",
          label: "Custom",
          active: pathname.includes("/custom"),
          icon: Newspaper,
          under_construction: true,
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
