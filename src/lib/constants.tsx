import {
  MonitorCog,
  MonitorSmartphone,
  Clock,
  ZoomIn,
  Radio,
  Dices,
  MessageCircle,
  Shuffle,
  Cog,
  BookDashed,
  LayoutGrid,
  Space,
  RectangleEllipsis,
  TextSearch,
  RotateCw,
  RockingChair,
  Text,
} from "lucide-react";
import { AIBadge } from "~/components/AIBadge";
import type { ItemGridData } from "~/components/ItemGrid";

export const APP_NAME = "ClassQuest";
export const GRADES = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
export const FLIP_WORDS = [
  "excitement!",
  "adventure!",
  "achievement!",
  "challenge!",
  "customization!",
  "progression!",
  "incentivization!",
];
export const LOADING_MESSAGES: string[] = [
  "Sharpening pencils... and minds!",
  "Preparing quests... and your brain!",
  "Gathering supplies... where’s my magic wand?",
  "Unlocking achievements... like a true adventurer!",
  "Brain power activated... let’s go!",
  "Charging up your imagination... almost there!",
  "Saddle up! We're heading into Learningville!",
  "Preparing your adventure... grab your thinking cap!",
  "Loading awesome... stay tuned!",
  "Magic math wands on standby!",
  "Mixing knowledge potions... almost ready!",
  "Making learning more epic... hold on!",
  "Finding treasure... in your next lesson!",
  "Stretching your brain... just a little longer!",
  "Summoning the power of learning!",
  "Unlocking level 5: Super Student!",
  "Loading fun... and a little bit of math!",
  "Crossing the bridge to Knowledge Land!",
  "Casting spells of curiosity... almost done!",
  "Upgrading your brain... stay tuned!",
  "Hold tight! The quest begins soon!",
  "Gathering facts... with a sprinkle of fun!",
  "Creating fun challenges... just for you!",
  "Building bridges... between you and knowledge!",
  "Knights of Learning, assemble!",
  "Loading your next adventure... almost there!",
  "Connecting the dots... of fun and learning!",
  "Shuffling ideas... and treasure maps!",
  "Grab your backpack... learning starts soon!",
  "Turning gears of knowledge... stay with us!",
  "Polishing shields... and pencils!",
  "Clearing the path to success... hold on tight!",
  "Gathering quests... and fun facts!",
  "Almost there! Knowledge awaits!",
  "Packing your learning toolkit!",
  "Sharpening swords... and spelling!",
  "Ready, set... learn!",
  "Deploying fun... in 3... 2... 1!",
  "Watch out for the learning dragon!",
  "Your adventure is loading... magic in progress!",
  "Charging up your curiosity!",
  "Creating riddles... for your quest!",
  "Bracing for knowledge!",
  "Fastening seat belts... learning blast-off!",
  "Loading treasure chests... of knowledge!",
  "Casting spells... of awesome learning!",
  "The adventure is almost here!",
  "Fueling up on fun facts!",
  "Hold tight, learning heroes!",
  "Almost there! Get ready to explore!",
];
export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const screensData: ItemGridData[] = [
  {
    name: "Classroom Screen",
    description:
      "Display various widgets on a shared screen for your whole class to see.",
    icon: MonitorCog,
    badge: null,
    href: "/assigners/random",
    under_construction: true,
  },
  {
    name: "Teacher Screen",
    description:
      "Easily control what's shown on the Classroom Screen and manage student points right from your phone.",
    icon: MonitorSmartphone,
    badge: null,
    href: "/assigners/round-robin",
    under_construction: true,
  },
];
export const toolsData: ItemGridData[] = [
  {
    name: "Classroom Clock",
    description:
      "Show a full-screen clock with easy-access timers and rotation schedules for classroom centers.",
    icon: Clock,
    href: "/tools/classroom-clock",
    under_construction: true,
  },
  {
    name: "MagniText",
    description:
      "Display large text on your phone so it's easy for students to read from a distance.",
    icon: ZoomIn,
    href: "/tools/magni-text",
    under_construction: true,
  },
  {
    name: "Random Event",
    description:
      "Randomly choose a daily event from default options or ones you've added.",
    icon: Radio,
    href: "/tools/round-robin",
    under_construction: true,
  },
  {
    name: "Randomizer",
    description:
      "Randomly select a class, group, or student for activities or assignments.",
    icon: Dices,
    href: "/tools/randomizer",
  },
  {
    name: "Silent Chat",
    description:
      "Communicate silently with a student by passing your phone between each other.",
    icon: MessageCircle,
    href: "/tools/silent-chat",
    under_construction: true,
  },
  {
    name: "Shuffler",
    description:
      "Randomly order your classes, groups, or students, ensuring everyone gets a chance to be first and last before any repeats.",
    icon: Shuffle,
    href: "/tools/shuffler",
  },
];
export const generatorsData: ItemGridData[] = [
  {
    name: "Custom",
    description:
      "Design your own worksheet by selecting activities from any of the Generators.",
    icon: Cog,
    badge: null,
    href: "/generators/custom",
    under_construction: true,
  },
  {
    name: "Cloze",
    description:
      "Create reading passages with missing words (e.g., adjectives, nouns) for students to fill in that are tailored to each student's reading level.",
    icon: BookDashed,
    badge: <AIBadge />,
    href: "/generators/cloze",
    under_construction: true,
  },
  {
    name: "Crossword Puzzle",
    description: "Create fun crossword puzzles by entering words and clues.",
    icon: LayoutGrid,
    badge: null,
    href: "/generators/crossword",
    under_construction: true,
  },
  {
    name: "Fill-in-the-Blank",
    description:
      "Create fill-in-the-blank sentences tailored to your students' reading levels, with optional word banks.",
    icon: Space,
    badge: <AIBadge />,
    href: "/generators/fill-in-the-blank",
    under_construction: true,
  },
  {
    name: "Reading Passage",
    description:
      "Produce reading passages on any topic, customized for each student's reading level.",
    icon: Text,
    badge: <AIBadge />,
    href: "/generators/reading-passage",
    under_construction: true,
  },
  {
    name: "Word Search",
    description:
      "Create word searches by entering words, with options to adjust difficulty (e.g., reveal directions or letters).",
    icon: LayoutGrid,
    badge: null,
    href: "/generators/word-search",
    under_construction: true,
  },
  {
    name: "Scramble Words",
    description:
      "Create worksheets where students unscramble words you provide.",
    icon: RectangleEllipsis,
    badge: null,
    href: "/generators/unscramble",
    under_construction: true,
  },
  {
    name: "Vocabulary Hunt",
    description:
      "Produce reading passages using specific vocabulary words, tailored to each student's reading level.",
    icon: TextSearch,
    badge: <AIBadge />,
    href: "/generators/vocabulary-hunt",
    under_construction: true,
  },
];
export const assignersData: ItemGridData[] = [
  {
    name: "Random",
    description: "Randomly assign students to all the fungible things!",
    icon: Dices,
    badge: null,
    href: "/assigners/random",
  },
  {
    name: "Round-Robin",
    description: "Randomly assign students ensuring everyone gets a turn!",
    icon: RotateCw,
    badge: null,
    href: "/assigners/round-robin",
  },
  {
    name: "Seats",
    description:
      "Randomly assign students to seats, ensuring boys sit next to girls!",
    icon: RockingChair,
    badge: null,
    href: "/assigners/seats",
    under_construction: true,
  },
];
