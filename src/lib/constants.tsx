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
      "Take attendance for any class easily when viewing any class, effecting which students can earn points for the day.",
    icon: CheckSquare,
    href: "/classes",
    under_construction: false,
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
      "Award student points for good behaviors, and remove points for negative behaviors easily when viewing any class. Students can then redeem things using those points.",
    icon: CirclePlus,
    href: "/classes",
    under_construction: false,
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
  {
    name: "Swear Word",
    description: "The student said a swear word.",
    point_value: -5,
    icon: "fas heart-crack",
    color: "#ff0000",
    title: "Potty Mouth",
  },
];

export type ConversationStarter = {
  text: string;
  category: "learning" | "encouragement" | "daily" | "goals";
};

export const conversationStarters: ConversationStarter[] = [
  // Learning focused
  {
    text: "Can you teach me a new word you learned in English?",
    category: "learning",
  },
  { text: "What book are you reading right now?", category: "learning" },
  {
    text: "What's one thing you know now that you didn’t know last week?",
    category: "learning",
  },
  {
    text: "If you could learn about any topic today, what would it be?",
    category: "learning",
  },
  {
    text: "What English word is hard to pronounce for you?",
    category: "learning",
  },
  {
    text: "Do you like reading, writing, speaking, or listening to English the most?",
    category: "learning",
  },
  {
    text: "Can you explain what a 'noun' is in your own words?",
    category: "learning",
  },
  { text: "Which words sound funny to you in English?", category: "learning" },
  {
    text: "If you had to write a story today, what would it be about?",
    category: "learning",
  },
  {
    text: "Can you think of a word in your language that sounds similar to an English word?",
    category: "learning",
  },
  {
    text: "What strategy do you use when you don't understand a word?",
    category: "learning",
  },
  {
    text: "What’s a topic you would like to research more?",
    category: "learning",
  },
  {
    text: "Can you think of a sentence with the word 'because' in it?",
    category: "learning",
  },
  { text: "What's one new fact you learned this week?", category: "learning" },
  {
    text: "If you were a teacher, how would you help someone learn a new word?",
    category: "learning",
  },

  // Encouragement
  {
    text: "Your hard work is paying off — keep going!",
    category: "encouragement",
  },
  {
    text: "Even when it's hard, you're still trying. That's amazing!",
    category: "encouragement",
  },
  {
    text: "I noticed how you kept trying even when it was difficult. Great job!",
    category: "encouragement",
  },
  {
    text: "Mistakes are part of learning. You're doing an awesome job!",
    category: "encouragement",
  },
  {
    text: "You have learned so much already. Imagine how much more you’ll learn!",
    category: "encouragement",
  },
  {
    text: "You're getting better every single day!",
    category: "encouragement",
  },
  {
    text: "Remember, everyone learns at their own pace. You’re doing just fine!",
    category: "encouragement",
  },
  {
    text: "Don't give up now – you're so close to understanding it!",
    category: "encouragement",
  },
  {
    text: "Look how far you've come from the beginning of the year!",
    category: "encouragement",
  },
  {
    text: "I believe in you – you’re smarter than you think!",
    category: "encouragement",
  },
  {
    text: "Small steps every day lead to big changes!",
    category: "encouragement",
  },
  {
    text: "You have the power to improve little by little, and that’s awesome!",
    category: "encouragement",
  },
  {
    text: "You just did something really tricky — celebrate that!",
    category: "encouragement",
  },
  {
    text: "If something feels too hard, it just means your brain is growing!",
    category: "encouragement",
  },
  {
    text: "You’re better at this today than you were yesterday. Progress is real!",
    category: "encouragement",
  },

  // Daily activities
  { text: "What did you have for breakfast today?", category: "daily" },
  { text: "What’s your favorite part of the school day?", category: "daily" },
  {
    text: "If you could do anything right now, what would it be?",
    category: "daily",
  },
  { text: "What's one thing that made you smile today?", category: "daily" },
  {
    text: "If you could have a superpower today, what would it be?",
    category: "daily",
  },
  {
    text: "What was something kind you did for someone today?",
    category: "daily",
  },
  { text: "What did you play at recess?", category: "daily" },
  { text: "Who did you sit next to at lunch today?", category: "daily" },
  {
    text: "What’s the weather like today? Is it hot, cold, sunny, or rainy?",
    category: "daily",
  },
  { text: "What’s your favorite thing to do after school?", category: "daily" },
  { text: "Did anything surprise you today?", category: "daily" },
  {
    text: "What’s one thing you’re really looking forward to this week?",
    category: "daily",
  },
  {
    text: "If you could be an animal today, what animal would you be?",
    category: "daily",
  },
  {
    text: "What’s the funniest thing that happened to you recently?",
    category: "daily",
  },
  {
    text: "If you could design a game for the class, what would it be about?",
    category: "daily",
  },

  // Goals and progress
  {
    text: "What is one thing you want to achieve by the end of the week?",
    category: "goals",
  },
  {
    text: "What are you most excited to learn about today?",
    category: "goals",
  },
  {
    text: "What do you think will be the most challenging thing for you this week?",
    category: "goals",
  },
  { text: "What’s one goal you have for next month?", category: "goals" },
  {
    text: "What can you do today to get better at English?",
    category: "goals",
  },
  {
    text: "If you could master one English word today, what would it be?",
    category: "goals",
  },
  {
    text: "If you make a mistake, what’s your plan to learn from it?",
    category: "goals",
  },
  {
    text: "What’s one thing you want to do better than yesterday?",
    category: "goals",
  },
  { text: "What’s one thing you did well this week?", category: "goals" },
  {
    text: "If you could set a goal for your class, what would it be?",
    category: "goals",
  },
  {
    text: "What will you do today to make your future self proud?",
    category: "goals",
  },
  {
    text: "What’s one question you have about something new you’re learning?",
    category: "goals",
  },
  { text: "What’s one habit you want to start this week?", category: "goals" },
  {
    text: "How will you know if you’re getting better at something?",
    category: "goals",
  },
  {
    text: "If you could set a challenge for yourself today, what would it be?",
    category: "goals",
  },
];

export interface AchievementData {
  name: string;
  icon: string; // e.g. "fas-seedling"
  colorClass: string; // e.g. "text-green-500"
}

type AchievementsMap = Record<string, AchievementData>;

// These increment at times 1.35 rounding up to nearest whole
export const ACHIEVEMENTS: AchievementsMap = {
  "1": {
    name: "Novice",
    icon: "fas seedling",
    colorClass: "text-green-500",
  },
  "2": {
    name: "Beginner",
    icon: "fas shoe-prints",
    colorClass: "text-purple-500",
  },
  "3": {
    name: "Amateur",
    icon: "fas graduation-cap",
    colorClass: "text-yellow-500",
  },
  "5": {
    name: "Initiate",
    icon: "fas map-signs",
    colorClass: "text-blue-500",
  },
  "7": {
    name: "Learner",
    icon: "fas book-open",
    colorClass: "text-pink-500",
  },
  "10": {
    name: "Apprentice",
    icon: "fas hammer",
    colorClass: "text-orange-500",
  },
  "14": {
    name: "Adept",
    icon: "fas tools",
    colorClass: "text-lime-500",
  },
  "19": {
    name: "Practitioner",
    icon: "fas scroll",
    colorClass: "text-red-500",
  },
  "26": {
    name: "Specialist",
    icon: "fas microscope",
    colorClass: "text-emerald-500",
  },
  "36": {
    name: "Competitor",
    icon: "fas trophy",
    colorClass: "text-indigo-500",
  },
  "49": {
    name: "Journeyman",
    icon: "fas compass",
    colorClass: "text-sky-500",
  },
  "67": {
    name: "Expert",
    icon: "fas chess-knight",
    colorClass: "text-purple-500",
  },
  "91": {
    name: "Artisan",
    icon: "fas palette",
    colorClass: "text-teal-500",
  },
  "123": {
    name: "Virtuoso",
    icon: "fas music",
    colorClass: "text-rose-500",
  },
  "166": {
    name: "Master",
    icon: "fas crown",
    colorClass: "text-fuchsia-500",
  },
  "224": {
    name: "Champion",
    icon: "fas medal",
    colorClass: "text-green-500",
  },
  "303": {
    name: "Hero",
    icon: "fas shield-alt",
    colorClass: "text-yellow-500",
  },
  "409": {
    name: "Icon",
    icon: "fas star",
    colorClass: "text-orange-500",
  },
  "552": {
    name: "Myth",
    icon: "fas cloud-bolt",
    colorClass: "text-red-500",
  },
  "745": {
    name: "Legend",
    icon: "fas dragon",
    colorClass: "text-violet-500",
  },
};

interface EventVariable {
  name: string;
  description: string;
  examples: string[] | number[];
}

interface Event {
  title: string;
  description: string;
  vars: EventVariable[];
  event_sentence: string;
}

export const RANDOM_EVENTS: Event[] = [
  {
    title: "Word of the Day",
    description:
      "Everyone must include a specific word in every sentence they say.",
    vars: [
      {
        name: "word",
        description: "The word that must be included in every sentence.",
        examples: ["banana", "sparkle", "dinosaur"],
      },
    ],
    event_sentence:
      "Everyone must include the word '{word}' in every sentence they say.",
  },
  {
    title: "Accent Challenge",
    description:
      "Students must speak in a non-native accent for the class period.",
    vars: [
      {
        name: "accent",
        description: "The accent students must use.",
        examples: ["British", "Australian", "Southern"],
      },
    ],
    event_sentence:
      "Students must speak in a {accent} accent for the class period.",
  },
  {
    title: "Royal Treatment",
    description:
      "When talking to boys, end sentences with a title for boys, and for girls, use a title for girls.",
    vars: [
      {
        name: "title_for_boys",
        description: "The title used when addressing boys.",
        examples: ["Mi'Lord", "Your Highness", "Captain"],
      },
      {
        name: "title_for_girls",
        description: "The title used when addressing girls.",
        examples: ["Mi'Lady", "Your Majesty", "Commander"],
      },
    ],
    event_sentence:
      "When addressing boys, end sentences with '{title_for_boys}', and for girls, use '{title_for_girls}'.",
  },
  {
    title: "Silent Mode",
    description:
      "For a set amount of time, students can only communicate through gestures or written notes.",
    vars: [
      {
        name: "duration",
        description: "The length of time silent mode is active.",
        examples: ["10 minutes", "15 minutes", "until the next break"],
      },
    ],
    event_sentence:
      "For {duration}, students can only communicate through gestures or written notes.",
  },
  {
    title: "Backwards Day",
    description: "Students must say their sentences backwards.",
    vars: [
      {
        name: "reverse_rule",
        description: "The rule for reversing sentences.",
        examples: ["Entire sentence", "Only the last word", "Every other word"],
      },
    ],
    event_sentence: "Students must say their sentences {reverse_rule}.",
  },
  {
    title: "Rhyme Time",
    description:
      "Every sentence must rhyme with the last word of the previous sentence.",
    vars: [
      {
        name: "theme",
        description: "An optional theme for the rhyming words.",
        examples: ["Animals", "Food", "Nonsense words"],
      },
    ],
    event_sentence:
      "Every sentence must rhyme with the last word of the previous sentence{theme ? `, with the theme '${theme}'` : ''}.",
  },
  {
    title: "Question Mode",
    description: "Every statement must be turned into a question.",
    vars: [
      {
        name: "question_type",
        description: "The type of questions allowed.",
        examples: [
          "Yes/No questions",
          "Open-ended questions",
          "Rhetorical questions",
        ],
      },
    ],
    event_sentence: "Every statement must be turned into a {question_type}.",
  },
  {
    title: "Animal Impressions",
    description: "Students must end their sentences with an animal sound.",
    vars: [
      {
        name: "animal",
        description: "The animal sound students must use.",
        examples: ["Moo", "Oink", "Roar"],
      },
    ],
    event_sentence:
      "Students must end their sentences with an animal sound: '{animal}'.",
  },
  {
    title: "Opposite Day",
    description: "Students must say the opposite of what they mean.",
    vars: [
      {
        name: "scope",
        description: "The extent of the opposite rule.",
        examples: ["Entire sentence", "Only adjectives", "Specific words"],
      },
    ],
    event_sentence:
      "Students must say the opposite of what they mean for {scope}.",
  },
  {
    title: "Whisper Zone",
    description: "Everyone must whisper for a set amount of time.",
    vars: [
      {
        name: "duration",
        description: "The length of time whispering is required.",
        examples: [
          "15 minutes",
          "Until the next activity",
          "The entire class period",
        ],
      },
    ],
    event_sentence: "Everyone must whisper for {duration}.",
  },
  {
    title: "Compliment Chain",
    description:
      "Before speaking, students must give a compliment to the person who last spoke.",
    vars: [
      {
        name: "compliment_type",
        description: "The type of compliment required.",
        examples: [
          "Specific (e.g., 'I like your shoes')",
          "General (e.g., 'You're awesome')",
        ],
      },
    ],
    event_sentence:
      "Before speaking, students must give a {compliment_type} to the person who last spoke.",
  },
  {
    title: "Story Builders",
    description:
      "Each student adds one sentence to a collective story when they speak.",
    vars: [
      {
        name: "theme",
        description: "The theme of the story.",
        examples: ["Pirates", "Space", "Jungle"],
      },
    ],
    event_sentence:
      "Each student adds one sentence to a collective story with the theme '{theme}' when they speak.",
  },
  {
    title: "Pirate Talk",
    description: "Everyone must speak like a pirate.",
    vars: [
      {
        name: "actions",
        description: "Optional pirate actions to accompany speech.",
        examples: [
          "Walking with a limp",
          "Using a pretend telescope",
          "Saying 'Arrr!' frequently",
        ],
      },
    ],
    event_sentence:
      "Everyone must speak like a pirate{actions ? ` and perform actions like ${actions}` : ''}.",
  },
  {
    title: "Emoji Only",
    description: "Students can only communicate using emojis.",
    vars: [
      {
        name: "allow_words",
        description: "Whether to allow one-word clues alongside emojis.",
        examples: ["Yes", "No"],
      },
    ],
    event_sentence:
      "Students can only communicate using emojis{allow_words === 'Yes' ? ', with one-word clues allowed' : ''}.",
  },
  {
    title: "Superhero Mode",
    description:
      "Students must introduce themselves with a superhero name and power before speaking.",
    vars: [
      {
        name: "theme",
        description: "The theme for superhero names and powers.",
        examples: ["Villains", "Wizards", "Animals"],
      },
    ],
    event_sentence:
      "Students must introduce themselves with a superhero name and power based on the theme '{theme}' before speaking.",
  },
  {
    title: "Time Traveler",
    description:
      "Students must speak as if they’re from a different time period.",
    vars: [
      {
        name: "era",
        description: "The time period students must emulate.",
        examples: ["Medieval", "Futuristic", "1950s"],
      },
    ],
    event_sentence: "Students must speak as if they’re from the '{era}' era.",
  },
  {
    title: "Sing It Out",
    description: "Students must sing their sentences instead of speaking them.",
    vars: [
      {
        name: "genre",
        description: "The musical genre for singing.",
        examples: ["Opera", "Rap", "Country"],
      },
    ],
    event_sentence:
      "Students must sing their sentences in the '{genre}' genre instead of speaking them.",
  },
  {
    title: "Word Limit",
    description: "Students can only use a set number of words per sentence.",
    vars: [
      {
        name: "word_count",
        description: "The maximum number of words allowed per sentence.",
        examples: [3, 5, 7],
      },
    ],
    event_sentence:
      "Students can only use up to {word_count} words per sentence.",
  },
  {
    title: "Mystery Object",
    description:
      "A random object becomes the 'talking stick.' Only the person holding it can speak.",
    vars: [
      {
        name: "object",
        description: "The object used as the talking stick.",
        examples: ["Pencil", "Stuffed animal", "Toy"],
      },
    ],
    event_sentence:
      "A random object, such as a '{object}', becomes the 'talking stick.' Only the person holding it can speak.",
  },
  {
    title: "Doodle Dialogue",
    description: "Students must draw their response instead of speaking.",
    vars: [
      {
        name: "allow_captions",
        description: "Whether to allow one-word captions with drawings.",
        examples: ["Yes", "No"],
      },
    ],
    event_sentence:
      "Students must draw their response instead of speaking{allow_captions === 'Yes' ? ', with one-word captions allowed' : ''}.",
  },
];
