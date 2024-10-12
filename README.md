# Mr. Monkey's Worksheet Generators

This is the collection of worksheet generators that I have created as I needed them in my teaching career.

## Name Ideas

- Class Commander

## To-do List

### p4

- Look into the APIs to determine the tier of a vocabulary word
  - [Datamuse API](https://www.datamuse.com/api/)
    https://www.npmjs.com/package/datamuse
  - [WordsAPI](https://www.wordsapi.com/)
- integrate Google Gemini API (because it's the only one that's free)
  - when exporting the generated content, ensure the answer key is on a separate page to the work sheet. Also, format these better than MagicSchoolAI. Their formatting is very rudimentary.
- integrate other models and let the user purchase tokens
  - Stripe
- tool: text scaffolder (duplicates [this](https://www.magicschool.ai/tools/text-scaffolder-tool). This tool only outputs vocabulary and questions, it does NOT scaffold.)
- worksheet: Custom (user picks and chooses which ones to include and the form is built dynamically to accommodate)
- worksheet: Vocabulary Hunt (uses the reading passage generator tool)
- worksheet: cloze
- worksheet: reading passage generator (similar to [this](https://www.magicschool.ai/tools/vocabulary-based-text-generator))
  - use morphological variations?
  - generate one for each student?
    - automatically set word count by the student's grade level
  - vocabulary input
  - topic input
  - length (only appears if **generate for each student** is unchecked)
  - grade level (only appears if **generate for each student** is unchecked)
  - generate comprehension questions?

### p3

- screen: Classroom Screen -- a screen that displays the clock and displays shuffler.
  - Shuffler can be run from another user session, like a phone, then the results will appear on the screen.
  - A timer can be set from another user session and will appear on the screen.
- screen: Teacher screen, in-class
  - quick access to randomizer, shuffler, create a timer -- all get pushed to the Classroom Screen
  - quick access to attendance, local chat, MagniText
  - quick access to each student to award/subtract points
    - can filter the students by group
  - can easily select multiple students

### p2

- tool: classroom clock (duplicates [Class Timers](https://mjf1406.github.io/class-timers/index.html))
- tool: MagniText -- (duplicates [MagniText](https://mjf1406.github.io/magni-text/index.html))
- tool: Random Event

### p1

- worksheet: word search
- worksheet: scramble words
- worksheet: crossword
- tool: local chat -- launch a chat window that allows the device to be passed between parties to have a silent chat.
- tool: Shuffler -- shuffle history is now stored in the DB to persist across user sessions
- tool: Shuffler -- UI now indicates who has been first/last and how many times and on what date
- tool: Assigner, Round-Robin -- a history of items is now stored with a datetime object and is displayed in the UI as a table
- ⚠️ local-first: use [TinyBase](https://tinybase.org/) to implement a local-first architecture
- ⚠️ i18n: use [next-international](https://next-international.vercel.app/docs/app-setup) for localization

### p0

- tool: Points -- track points on a per student, group, and class basis
  - features
    - [ ] award points
      - [ ] to a single student
        - [x] clicking on the student opens a dialog with a grid list of all behaviors, with positive and needs work as tabs
        - [ ] need a quantity that defaults to 1
      - [x] to selected students
      - [ ] streaks are tracked for each student, and the teacher is alerted
        - [ ] off days should be declared in the settings, so they are excluded from breaking streaks
    - [ ] positive and negative behavior
      - [x] user can create them, setting an icon, name, and point value
      - [ ] user can edit
      - [ ] user can delete
    - [ ] redemption items
      - [ ] user can create, setting cost, name, and icon
      - [ ] user can delete
      - [ ] user can edit
    - [ ] redeeming items
      - [ ] user can select multiple students to redeem the same thing simultaneously
      - [ ] user can select quantity of redemption item to apply to selected students
- tool: Attendance
  - [ ] stores presence and absence based on user's local time zone
  - [ ] prevents absent students from receiving points
- fixed: the DB migration issue... kill me
- when editing a group's members or creating a group, should be able to set the selected students to the opposite of another group, e.g. I want Group B to be all the students not in Group A

## Change Log

2024/10/12

- can apply behaviors to selected students
- fixed up drawer and dialog sizes on mobile
- behaviors can now be created
- user can now apply behaviors, awarding or removing points
- finished the client-side UI for the new classes view, setting everything up for adjusting points and tracking attendance
- attendance UI is done

2024/10/10

- switched the old view to edit class
- opening a class now displays a grid of students with non-functioning buttons and radio groups
- can now click into a group on the main class page

2024/10/08

- fixed: The output PDF now ensures that jobs with duplicate items gets printed correctly

2024/10/01

- fixed: groups are now in the UI upon creation, no longer requiring a refresh
- UI: user can now delete groups from the db
- fixed: student gender is now displayed in the students table
- fixed: Seats Assigner now correctly places students by sex and the output is ordered by seat number
- fixed: when opening a class, the class name now appears in the navbar instead of the class ID

2024/09/21

- fixed: minor bug when generating item_status for round robin and seat assigners

2024/09/19

- UI: small layout updates to SpinningWheel, removed the Spin button and made the wheel clickable
- UX: selected items are now removed when clicking Auto-remove selected items and then placed back when unchecking in SpinningWheel
- UI: small layout update to AnimatedShuffle2
- some changes to the homepage

2024/09/18

- UI: added wheel spinner to Randomizer
- UI: added fun shuffled animation to Shuffler

2024/09/15

- fixed: new sidebar now no longer has a scroll bar on mobile
- tool: Assigner, Seats MVP released

2024/09/14

- UI: in the NavBar, add the breadcrumb and create dropdowns for categories, e.g. if on the Randomizer page, then the user would see tools > Randomizer, and Tools would be a dropdown allowing them to select another tool
- fixed: Loading.tsx now loads a different loading message on every mount
- bug: fixed logo only appearing when sidebar is collapsed
- bug: fixed theme toggle icon being weird on scroll
- UI: set up the footer of the sidebar to have Clerk button, settings link, and theme toggle

2024/09/13

- Reading Passage is now a Generator
- URLs: put worksheet generators behind `/generators/`
- URLs: put tools behind `/tools/`
- backend: redid the round-robin assigner algo
- UX: updated the UI of both assigners, they are consistent and have no strange CLS now

2024/09/10

- backend: all data fetching is done using ReactQuery now

2024/08/27

- tool: Shuffler
- tool: Randomizer

2024/08/23

- added: Assigner, Round-Robin now allows for one boy and one girl to be selected if there are two jobs with the same name

2024/08/22

- fixed: server no longer loads stale data

2024/08/21

- fixed: the DB no longer has strange errors
- added: added [ALPHA] to the sidebar logo

2024/08/08

- added: Assigner, Round-Robin & user can download or print the resultant table as PDF
- added: Assigner, Random tool & user can download or print the resultant table as PDF

2024/08/06

- UX: user can add student(s) to an existing class
- UX: user can edit existing students (in the table?)

2024/08/05

- added: user can now edit groups
- UI: My Classes page works
- added: user can now create groups within classes
- UX: groups are now displayed on the `[classId]`
- added: user can add a class

2024/08/04

- UI: sidebar nav is used when a user is logged in
