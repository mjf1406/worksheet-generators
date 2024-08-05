## Core Tables

### Teachers

- **Contains details about each teacher, such as:**
  - `TeacherID`: Unique identifier for each teacher.
  - `Name`: Full name of the teacher.
  - `Email`: Email address of the teacher.
  - `Department`: Department to which the teacher belongs.

### Classes

- **Stores information about each class, such as:**
  - `ClassID`: Unique identifier for each class.
  - `ClassName`: Name or title of the class.
  - `Schedule`: Information on when the class meets.
  - **Note:** In this case, we won't store a direct link to a single teacher due to the many-to-many relationship with teachers.

### Students

- **Holds information on each student, such as:**
  - `StudentID`: Unique identifier for each student.
  - `Name`: Full name of the student.
  - `Email`: Email address of the student.
  - `EnrollmentDate`: Date when the student was enrolled.

## Junction Tables

### StudentClasses

- **Manages the many-to-many relationship between students and classes. This table includes fields like:**
  - `EnrollmentID`: Unique identifier for each enrollment record.
  - `StudentID`: Foreign key referencing `StudentID` to indicate the student enrolled.
  - `ClassID`: Foreign key referencing `ClassID` to indicate the class enrolled in.
  - `EnrollmentDate`: The date when the student enrolled in the class.

### TeacherClasses

- **Manages the many-to-many relationship between teachers and classes. This table features fields such as:**
  - `AssignmentID`: Unique identifier for each teaching assignment.
  - `TeacherID`: Foreign key referencing `TeacherID` to indicate the teacher assigned.
  - `ClassID`: Foreign key referencing `ClassID` to indicate the class taught.
  - `Role`: The role of the teacher in the class (e.g., Primary Instructor, Assistant).
  - `AssignedDate`: Date when the teacher was assigned to the class.

## Summary

- **Teachers Table**: Contains individual teacher details.
- **Classes Table**: Contains details about classes but does not directly link to teachers.
- **Students Table**: Contains individual student details.
- **StudentClasses Table**: Links students and classes, managing enrollments.
- **TeacherClasses Table**: Links teachers and classes, managing teaching assignments.

These tables together will allow you to manage the relationships between teachers, students, and classes efficiently, catering to both the many-to-many relationships and maintaining flexibility for various operations such as enrollments, class assignments, and more. This structure should serve as a robust foundation for your Next.js application using Turso as your database backend.

-- Inserting data into the Teachers table
INSERT INTO teachers (teacher_id, teacher_name, teacher_email)
VALUES
(1, 'John Doe', 'johndoe@example.com'),
(2, 'Jane Smith', 'janesmith@example.com'),
(3, 'Alice Johnson', 'alicejohnson@example.com'),
(4, 'Carlos Ray', 'carlosray@example.com'),
(5, 'Lisa Ray', 'lisaray@example.com'),
(6, 'Tom Brook', 'tombrook@example.com'),
(7, 'Nora Bates', 'norabates@example.com'),
(8, 'Jerry Long', 'jerrylong@example.com'),
(9, 'Olivia Shore', 'oliviashore@example.com'),
(10, 'Ian Gruff', 'iangruff@example.com');

-- Inserting data into the Classes table
INSERT INTO classes (class_id, class_name, class_language)
VALUES
(1, 'Mathematics 101', 'en-US'),
(2, 'Physics 201', 'en-US'),
(3, 'Chemistry 301', 'en-US'),
(4, 'Biology 101', 'en-US'),
(5, 'Statistics 201', 'en-US'),
(6, 'English Literature 101', 'en-US'),
(7, 'World History 301', 'en-US'),
(8, 'Computer Science 101', 'en-US'),
(9, 'Art History 201', 'en-US'),
(10, 'Environmental Science 301', 'en-US');

-- Inserting data into the Students table
INSERT INTO students (student_id, student_name, student_email)
VALUES
(1, 'Bob Lee', 'boblee@example.com'),
(2, 'Sara Kay', 'sarakay@example.com'),
(3, 'Mike Ross', 'mikeross@example.com'),
(4, 'Emily Stone', 'emilystone@example.com'),
(5, 'Luke Shaw', 'lukeshaw@example.com'),
(6, 'Zara Moon', 'zaramoon@example.com'),
(7, 'Leo Crane', 'leocrane@example.com'),
(8, 'Nina Ricci', 'ninaricci@example.com'),
(9, 'Tony Stark', 'tonystark@example.com'),
(10, 'Lana Kane', 'lanakane@example.com');

-- Inserting data into the StudentClasses table
INSERT INTO student_classes (enrollment_id, student_id, class_id)
VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 6),
(7, 7, 7),
(8, 8, 8),
(9, 9, 9),
(10, 10, 10);

-- Inserting data into the TeacherClasses table
INSERT INTO teacher_classes (assignment_id, teacher_id, class_id, role)
VALUES
(1, 1, 1, 'primary'),
(2, 2, 2, 'primary'),
(3, 3, 3, 'assistant'),
(4, 4, 4, 'primary'),
(5, 5, 5, 'assistant'),
(6, 6, 6, 'primary'),
(7, 7, 7, 'primary'),
(8, 8, 8, 'assistant'),
(9, 9, 9, 'primary'),
(10, 1, 10, 'assistant');
(11, user_2hJQqqywkygYAjPEoAncvveceXL, 2, 'assistant');
(12, user_2hJQqqywkygYAjPEoAncvveceXL, 10, 'primary');
(13, user_2hJQqqywkygYAjPEoAncvveceXL, 1, 'assistant');
(14, user_2hJQqqywkygYAjPEoAncvveceXL, 5, 'primary');
