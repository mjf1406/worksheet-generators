import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Core Tables

export const users = sqliteTable('users',
    {
        user_id: text('user_id').notNull().primaryKey(),
        user_name: text('user_name').notNull(),
        user_email: text('user_email').notNull().unique(),
        user_role: text('user_role', { enum: ["teacher","admin"] }), // All users who sign up will be assigned the teacher role. Will need to manually assign admins.
        joined_date: text('joined_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }
)

export const classes = sqliteTable('classes',
    {
        class_id: text('class_id').notNull().primaryKey(),
        class_name: text('class_name').notNull(),
        class_language: text('class_language').notNull(),
        class_grade: text('class_grade', { enum: ["1","2","3","4","5"] }),
        class_year: text('class_year'),
        complete: text('complete', { mode: 'json' }).$type<{ s1: boolean, s2: boolean }>(),
        created_date: text('created_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }
)

export const students = sqliteTable('students',
    {
        student_id: text('student_id').notNull().primaryKey(),
        student_name_en: text('student_name_en').notNull(),
        student_name_alt: text('student_name_alt'),
        student_reading_level: text('student_reading_level'),
        student_grade: text('student_grade'),
        student_sex: text('student_sex', { enum: ["male", "female"] }),
        student_number: integer('student_number', { mode: 'number' }),
        student_email: text('student_email').unique(),
        joined_date: text('joined_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }
)

export const groups = sqliteTable('groups',
    {
        group_id: text('group_id').notNull().primaryKey(),
        group_name: text('group_name').notNull(),
        class_id: text('class_id').notNull().references(() => classes.class_id),
        created_date: text('created_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }, 
    (table) => {
        return {
            groups_by_class_id_idx: index("groups_by_class_id_idx").on(table.class_id)
        }
    }
)

// Junction Tables

export const student_classes = sqliteTable('student_classes',
    {
        enrollment_id: text('enrollment_id').notNull().primaryKey(),
        student_id: text('student_id').notNull().references(() => students.student_id),
        class_id: text('class_id').notNull().references(() => classes.class_id),
        enrollment_date: text('enrollment_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }, 
    (table) => {
        return {
            students_by_class_id_idx: index("students_by_class_id_idx").on(table.class_id)
        }
    }
)

export const teacher_classes = sqliteTable('teacher_classes',
    {
        assignment_id: text('assignment_id').notNull().primaryKey(),
        user_id: text('user_id').notNull().references(() => users.user_id),
        class_id: text('class_id').notNull().references(() => classes.class_id),
        role: text('role', { enum: ["primary", "assistant"] }),
        assigned_date: text('assigned_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }, 
    (table) => {
        return {
            classes_by_user_id_idx: index("classes_by_user_id_idx").on(table.user_id)
        }
    }
)

export const student_groups = sqliteTable('student_groups',
    {
        enrollment_id: text('enrollment_id').notNull().primaryKey(),
        group_id: text('group_id').notNull().references(() => groups.group_id),
        student_id: text('student_id').notNull().references(() => students.student_id),
        enrollment_date: text('enrollment_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    }, 
    (table) => {
        return {
            groups_by_student_id_idx: index("groups_by_student_id_idx").on(table.student_id)
        }
    }
)

export const assigners = sqliteTable('assigners',
    {
        assigner_id: text('assigner_id').notNull().primaryKey(),
        name: text('name').notNull(),
        user_id: text('user_id').notNull().references(() => users.user_id),
        assigner_type: text('assigner_type', { enum: ["random", "round-robin"] }),
        items: text('items', { mode: 'json' }),
        created_date: text('created_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => {
        return {
            assigner_by_user_id_idx: index("assigner_by_user_id_idx").on(table.user_id)
        }
    }
)