# Mr. Monkey's Worksheet Generators

This is the collection of worksheet generators that I have created as I needed them in my teaching career.

## To-do List

### p2

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
- tool: reading passage generator (similar to [this](https://www.magicschool.ai/tools/vocabulary-based-text-generator))
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

### p0

- backend: redid the API using tRPC
- tool: Shuffler (randomize the order of the class by group)
  - shuffle students (duplicates [Shuffle](https://mjf1406.github.io/various-classroom-tools/))
    - ensuring each student goes first and last before allowing anyone to go first or last again
- tool: Randomizer (random picker) -- allows the user to randomize basically everything
- URLs: put tools behind `/tools/`
- URLs: put worksheet generators behind `/worksheet-generators/`
- fixed: groups are now in the UI upon creation, no longer requiring a refresh

## Change Log

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
