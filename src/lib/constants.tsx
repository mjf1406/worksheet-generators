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
  AudioLines,
  Image,
  CheckSquare,
  CirclePlus,
} from "lucide-react";
import { AIBadge } from "~/components/AIBadge";
import type { ItemGridData } from "~/components/ItemGrid";
import type { Behavior, RewardItem } from "~/server/db/types";

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
    name: "Attendance",
    description:
      "Take attendance for any class, effecting which students can earn points for the day.",
    icon: CheckSquare,
    href: "/tools/attendance",
    under_construction: true,
  },
  {
    name: "Classroom Clock",
    description:
      "Show a full-screen clock with easy-access timers and rotation schedules for classroom centers.",
    icon: Clock,
    href: "/tools/classroom-clock",
    under_construction: true,
  },
  {
    name: "Image Background Remover",
    description:
      "Upload webp, jpg, or png and remove its background, then export as png.",
    icon: Image,
    href: "/tools/image-bg-remover",
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
    name: "Noise Monitor",
    description:
      "See how loud your students are being while in class and and alert everyone if it gets too loud.",
    icon: AudioLines,
    href: "/tools/noise-monitor",
  },
  {
    name: "Points",
    description:
      "Award student points for good behaviors, and remove points for negative behaviors.",
    icon: CirclePlus,
    href: "/tools/points",
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
    href: "/assigners/seats",
  },
];

export const DEFAULT_REDEMPTION_ITEMS: Omit<
  RewardItem,
  "item_id" | "class_id" | "created_date" | "updated_date" | "user_id"
>[] = [
  {
    name: "Homework Haven",
    description:
      "A student can turn in a homework assignment up to 2 days late.",
    price: 4,
    icon: "fas book-medical",
    type: "solo",
    title: "Homework Handler",
  },
  {
    name: "MIndfulness Minutes",
    description: "A student can take a 3-minute mindfulness break.",
    price: 10,
    icon: "fas brain",
    type: "solo",
    title: "Mindfulness Mediator",
  },
  {
    name: "Music Master",
    description: "A student can choose a song for the class to listen to.",
    price: 10,
    icon: "fas music",
    type: "solo",
    title: "Music Maestro",
  },
  {
    name: "Snack Session",
    description: "A student can eat a snack during class.",
    price: 10,
    icon: "fas utensils",
    type: "solo",
    title: "Snack Satisfier",
  },
  {
    name: "Seat Swap",
    description: "A student can switch seats with another student for a class.",
    price: 20,
    icon: "fas chair",
    type: "solo",
    title: "Seat Swapper",
  },
  {
    name: "Ghostly Gig",
    description: "A student can sit at the 👻 or 🐱‍👤 station during class.",
    price: 20,
    icon: "fas ghost",
    type: "solo",
    title: "Ghostly Guest",
  },
  {
    name: "Teacher Treat",
    description: "A student can get a piece of candy from the teacher.",
    price: 20,
    icon: "fas cookie-bite",
    type: "solo",
    title: "Teacher Treat-er",
  },
  {
    name: "Super Seat",
    description: "A student can switch chairs with the teacher for one class.",
    price: 25,
    icon: "fas couch",
    type: "solo",
    title: "Super Seater",
  },
  {
    name: "Freedom Fun",
    description:
      "The group can use 420 combined points to get 20 minutes of quiet free time.",
    price: 30,
    icon: "fas champagne-glasses",
    type: "group",
    title: "Freedom Facilitator",
  },
];

export const DEFAULT_BEHAVIORS: Omit<
  Behavior,
  "behavior_id" | "class_id" | "created_date" | "updated_date" | "user_id"
>[] = [
  {
    name: "Extra Materials, x1",
    description:
      "The student brought extra STEAM materials for another student to use, showing generosity.",
    point_value: 5,
    icon: "fas newspaper",
    color: "#007BFF",
    title: "Materials Master",
  },
  {
    name: "HW Turned in On Time",
    description: "The student turned their homework in on time.",
    point_value: 5,
    icon: "fas check-circle",
    color: "#28A745",
    title: "Homework Honorer",
  },
  {
    name: "Helping Others",
    description: "The student used their free time to help another student.",
    point_value: 3,
    icon: "fas hands-helping",
    color: "#20C997",
    title: "Helping Handler",
  },
  {
    name: "Material Check",
    description:
      "The student was ready for class before the timer hit zero (0).",
    point_value: 1,
    icon: "fas clipboard-check",
    color: "#FD7E14",
    title: "Material Manager",
  },
  {
    name: "Participating",
    description:
      "The student participated actively during class discussions and activities.",
    point_value: 1,
    icon: "fas comments",
    color: "#FFC107",
    title: "Participation Promoter",
  },
  {
    name: "Project On Time",
    description: "The student submitted their project by the deadline.",
    point_value: 5,
    icon: "fas project-diagram",
    color: "#6F42C1",
    title: "Project Pro",
  },
  {
    name: "RAZ Level Up",
    description: "The student achieved a new reading level on the RAZ test.",
    point_value: 10,
    icon: "fas level-up-alt",
    color: "#FFD700",
    title: "Reading Riser",
  },
  {
    name: "Reminded Politely",
    description:
      "The student reminded others politely about classroom rules or tasks.",
    point_value: 2,
    icon: "fas handshake",
    color: "#17A2B8",
    title: "Reminder Regulator",
  },
  {
    name: "Signed Work",
    description: "The student completed and signed their work appropriately.",
    point_value: 5,
    icon: "fas signature",
    color: "#E83E8C",
    title: "Signature Specialist",
  },
  {
    name: "Teamwork",
    description:
      "The student demonstrated effective teamwork skills during group activities.",
    point_value: 3,
    icon: "fas users",
    color: "#17A2B8",
    title: "Teamwork Titan",
  },
  {
    name: "Vocab. Log Word, x1",
    description: "The student added a new word to their vocabulary log.",
    point_value: 3,
    icon: "fas book",
    color: "#800000",
    title: "Vocabulary Virtuoso",
  },
  {
    name: "Job Well Done",
    description: "The student performed a task exceptionally well.",
    point_value: 5,
    icon: "fas thumbs-up",
    color: "#32CD32",
    title: "Job Journeyman",
  },
  {
    name: "On Task",
    description: "The student remained focused and on task during class.",
    point_value: 1,
    icon: "fas tasks",
    color: "#6C757D",
    title: "On-Task Operator",
  },
  {
    name: "Chapel Disruption",
    description: "The student disrupted chapel services.",
    point_value: -3,
    icon: "fas times-circle",
    color: "#DC3545",
    title: "Chapel Chaotic",
  },
  {
    name: "Konglish",
    description:
      "The student used a mix of Korean and English inappropriately.",
    point_value: -1,
    icon: "fas language",
    color: "#8B0000",
    title: "Konglish Kollider",
  },
  {
    name: "Non-English",
    description: "The student used a language other than English in class.",
    point_value: -2,
    icon: "fas language",
    color: "#8B0000",
    title: "Non-English Nuisance",
  },
  {
    name: "Noisy",
    description: "The student was noisy and disrupted the class environment.",
    point_value: -2,
    icon: "fas volume-mute",
    color: "#DC3545",
    title: "Noisy Nagger",
  },
  {
    name: "Running",
    description: "The student was running in class, causing disruptions.",
    point_value: -3,
    icon: "fas running",
    color: "#8B0000",
    title: "Running Rebel",
  },
  {
    name: "Off Task",
    description:
      "The student was off task and not engaged in class activities.",
    point_value: -2,
    icon: "fas ban",
    color: "#DC3545",
    title: "Off-Task Obstructor",
  },
];
