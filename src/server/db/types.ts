import type { SeatGroup, SeatingHistory } from "~/app/(user_logged_in)/assigners/seats/utils";
import type { BehaviorData, RewardItemData, StudentData } from "~/app/api/getClassesGroupsStudents/route";

// Server Types
export type UserDb = {
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: "teacher" | "admin",
    joined_date: string | undefined;
    updated_date: string | undefined;
}
export type Class = {
    class_id: string;
    class_name: string;
    class_language: string;
    class_grade: "1" | "2" | "3" | "4" | "5" | "6" | null;
    class_year: string | null;
    class_code: string;
    complete?: { s1: boolean; s2: boolean } | null;
    created_date: string;
    updated_date: string;
};

export type CommentsDb = {
    id: string,
    grade: string;
    semester: string;
    year: string;
    listening: { l1: string, l2: string, l3: string, l4: string, l5: string};
    mathematics: { l1: string, l2: string, l3: string, l4: string, l5: string};
    reading: { l1: string, l2: string, l3: string, l4: string, l5: string};
    science: { l1: string, l2: string, l3: string, l4: string, l5: string};
    social_studies: { l1: string, l2: string, l3: string, l4: string, l5: string};
    speaking: { l1: string, l2: string, l3: string, l4: string, l5: string};
    use_of_english: { l1: string, l2: string, l3: string, l4: string, l5: string};
    writing: { l1: string, l2: string, l3: string, l4: string, l5: string};
    [key: string]: string | { l1: string, l2: string, l3: string, l4: string, l5: string}; // Index signature
}
// Transformed Types
export type Course = {
    class_id: string | undefined;
    class_name: string | undefined;
    class_language: string | undefined;
    class_year: string | undefined;
    class_grade: string | undefined;
    updated_date: string | undefined;
    created_date: string | undefined;
    students: Student[];
    teachers?: Teacher[];
    complete: {
        s1: boolean,
        s2: boolean
    };
    groups?: Group[]
}

export type Group = {
    group_id: string,
    group_name: string,
    class_id: string,
    created_date: string,
    updated_date: string,
    students: StudentData[];
}

export type Teacher = {
    assigned_date: string | undefined;
    assignment_id: string | undefined;
    role: string | undefined;
    user_id: string | undefined;
    user_name: string | undefined;
    user_email: string | undefined;
    joined_date: string | undefined;
    updated_date: string | undefined;
}

export type TeacherCourse = {
    class_id: string;
    class_name: string;
    class_language: string;
    class_grade: string;
    class_year: string;
    class_code: string;
    created_date: string;
    updated_date: string;
    assigned_date: string;
    role: string;
    complete: {
        s1: boolean,
        s2: boolean
    };
    groups?: Group[]
    students: StudentData[] | undefined
    reward_items: RewardItemData[];
    behaviors: BehaviorData[];
    topics: Topic[];
    assignments: Assignment[];
    expectations: Expectation[];
    student_expectations: StudentExpectation[];
  }

export type PointRecord = {
    point_id: string;
    quantity: number;
    date: string;
}

export type RedemptionRecord = {
    item_id: string,
    date: string,
    quantity: number,
}

export type Student = {
    student_id?: string | undefined;
    student_name_en: string | undefined;
    student_name_first_en: string | undefined;
    student_name_last_en: string | undefined;
    student_name_alt: string | undefined;
    student_grade: string | undefined;
    student_reading_level: string | undefined;
    student_email: string | undefined | null;
    joined_date: string | undefined;
    updated_date: string | undefined;
    student_sex: "male" | "female" | undefined;
    student_number: number | undefined;
    enrollment_date?: string | undefined;
    enrollment_id?: string | undefined;
    isEditing?: boolean | undefined;
}

export type StudentField = {
    field_id: string;
    student_id: string;
    collaboration: { s1: string, s2: string };
    communication: { s1: string, s2: string };
    inquiry: { s1: string, s2: string };
    listening: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    mathematics: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    open_minded: { s1: string, s2: string };
    organization: { s1: string, s2: string };
    reading: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    responsibility: { s1: string, s2: string };
    risk_taking: { s1: string, s2: string };
    science: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    social_studies: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    speaking: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    thinking: { s1: string, s2: string };
    use_of_english: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    writing: { s1: string, s1_comment: string, s2: string, s2_comment: string };
    comment: { s1: string, s2: string };
    // [key: string]: string | { s1: string; s2: string }; // Index signature
}

// Assigners Table
export type Assigner = {
    assigner_id: string,
    name: string,
    user_id: string,
    assigner_type: "random" | "round-robin",
    items: string,
    student_item_status: AssignerItemStatuses,
    created_date: string,
    updated_date: string,
    groups?: SeatGroup[]
}

export type AssignerItemStatusesStudent = number
export type AssignerItemStatusesItem = Record<string, AssignerItemStatusesStudent>;
export type AssignerItemStatusesAssigner = Record<string, AssignerItemStatusesItem>;
export type AssignerItemStatusesClass = Record<string, AssignerItemStatusesAssigner>;
export type AssignerItemStatuses = Record<string, AssignerItemStatusesClass>

export type AssignerItemStatusesAssignerSeats = SeatingHistory;
export type AssignerItemStatusesClassSeats = Record<string, AssignerItemStatusesAssignerSeats>;
export type AssignerItemStatusesSeats = Record<string, AssignerItemStatusesClassSeats>

export type RandomEvent = {
    name: string,
    description: string,
}
  
  // New Behavior type
export type Behavior = {
    behavior_id: string;
    name: string;
    title?: string | null;
    point_value: number;
    description?: string | null;
    icon?: string | null;
    color?: string;
    class_id?: string;
    user_id: string;
    created_date: string;
    updated_date: string;
    achievements?: Achievement[];
  }
  
  // New RewardItem type
export type RewardItem = {
    item_id: string;
    price: number;
    name: string;
    title?: string | null;
    description?: string | null;
    icon?: string | null;
    class_id?: string;
    user_id: string;
    type: "solo" | "group" | "class";
    achievements?: Achievement[];
    created_date?: string;
    updated_date?: string;
  };

  export type AchievementClient = {
    id?: string; // Optional for existing achievements
    threshold: number;
    name: string;
  }

  export type RewardItemUpdate = Omit<RewardItem, "created_date" | "achievements"> & {
    achievements?: AchievementClient[];
  };

  export type AbsentDate = {
    id: string;
    user_id: string;
    class_id: string;
    student_id: string;
    date: string; // Format: YYYY-MM-DD
    created_date: string; // ISO date string
    updated_date: string; // ISO date string
}
  
export type PointType = 'positive' | 'negative' | 'redemption';

export type Point = {
    id: string;
    user_id: string;
    class_id: string;
    student_id: string;
    behavior_id?: string | null;
    reward_item_id?: string | null;
    type: PointType;
    number_of_points: number;
    created_date: string; // ISO date string
    updated_date?: string | null | undefined; // ISO date string
}

export type Achievement = {
    id: string;
    behavior_id: string | null;
    reward_item_id: string | null;
    class_id: string;
    user_id: string;
    threshold: number;
    name: string;
    created_date: string;
    updated_date: string;
};

export type NewAchievement = Omit<Achievement, 'created_date' | 'updated_date'>;

export type UpdateAchievement = Omit<Achievement, 'id' | 'created_date' | 'updated_date'>

export type Topic = {
    id: string;
    user_id: string;
    class_id: string;
    name: string;
}

export type AssignmentStatus = {
    student_id: string,
    complete: boolean,
    completed_ts: string,
}

export type Assignment = {
    id: string;
    user_id: string;
    class_id: string;
    name: string;
    description: string | null;
    data: string | null;
    due_date: string | null;
    topic: string | null;
    working_date: string | null;
    students?: AssignmentStatus[];
    created_date?: string | null;
}

export type Expectation = {
    id: string;
    user_id: string;
    class_id: string;
    name: string;
    description: string | null;
    created_date?: string | null;
    updated_date?: string | null;
}

export type StudentExpectation = {
    id: string;
    expectation_id: string;
    student_id: string;
    user_id: string;
    class_id: string;
    value?: string;
    number?: number;
    created_date: string;
    updated_date: string;
};