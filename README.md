# Mr. Monkey's Worksheet Generators

This is the collection of worksheet generators that I have created as I needed them in my teaching career.

## To-do List

### p4

- Look into the APIs to determine the tier of a vocabulary word
  - [Datamuse API](https://www.datamuse.com/api/)
    https://www.npmjs.com/package/datamuse
  - [WordsAPI](https://www.wordsapi.com/)
-

### p3

- integrate Google Gemini API (because it's the only one that's free)
- integrate other models and let the user purchase tokens
  - Stripe
- tool: text scaffolder (duplicates [this](https://www.magicschool.ai/tools/text-scaffolder-tool). This tool only outputs vocabulary and questions, it does NOT scaffold.)

### p2

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

### p1

- worksheet: word search
- worksheet: scramble words
- worksheet: crossword
- tool: classroom clock (duplicates [Class Timers](https://mjf1406.github.io/class-timers/index.html))
- tool: MagniText -- use a fullscreen modal to display the text
- tool: local chat -- launch a chat window that allows the device to be passed between parties to have a silent chat.
- screen: Classroom Screen -- a screen that displays the clock and displays shuffler.
  - Shuffler can be run from another user session, like a phone, thene the results will apear on the screen.
  - A timer can be set from another user session and will appear on the screen.
- tool: Points -- track points on a per student, group, and class basis
  - add redemption items
  - implement streaks for doing things, like material check every day, etc.
  - the teacher can upload an image to represent each student.
- tool: Attendance based on user's local time zone and loads already input data every time it's clicked on the same day.
- screen: Teacher screen, in-class
  - quick access to randomizer, shuffler, create a timer -- all get pushed to the Classroom Screen
  - quick access to attendance, local chat, magnitext
  - quick access to each student to award/subtract points
    - can filter the students by group
  - can easily select multiple students
 - tool: Assigner, Seats
  - Randomize where girls and boys go? Odd or even
    - to ensure they don't sit next to each other again, if number is odd, add 1, and if even, subtract 1.
      - keep a list of students who are next to them in the DB and use the above to check it
      - this should still be over the year, though, to ensure they sit next to someone new as often as possible
  - Algo steps
    1. randomly assign a seat where they haven't sat before
    2. check adjacent person, if already sat next to them, back to step 1.
    3. check group, if already in the group with the same person, back to step 1 (this one will have a limit because it's not as important as step 2. Maybe make this a convolution step? So once steps 1 and 2 are satisfied, go back over it to satisfy number 3 if it's even possible.)

### p0

- tool: Random Event
- backend: redid the API using tRPC
- backend: all data fetching is done using ReactQuery now
  - [ ] My classes
  - [ ] Random assigner
  - [ ] Round-Robin assigner
  - [x] Randomizer
  - [x] Shuffler
- URLs: put tools behind `/tools/`
- URLs: put worksheet generators behind `/generators/`
- fixed: groups are now in the UI upon creation, no longer requiring a refresh
- tool: Shuffler -- shuffle history is now stored in the DB to persist across user sessions
- tool: Shuffler -- UI now indicates who has been first/last and how many times and on what date
- tool: Assigner, Round-Robin -- a history of items is now stored with a datetime object and is displayed in the UI as a table
- Reading Passage is now a Worksheet Generator

## Change Log

2024/08/27

- tool: Shuffler
- tool: Randomizer

2024/08/23

- added: Assigner, Random now allows for one boy and one girl to be selected if there are two jobs with the same name

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
