# Mr. Monkey's Worksheet Generators

This is the collection of worksheet generators that I have created as I needed them in my teaching career.

## To-do List

### p2

- Look into the APIs to determine the tier of a vocabulary word
  - [Datamuse API](https://www.datamuse.com/api/)
    https://www.npmjs.com/package/datamuse
  - [WordsAPI](https://www.wordsapi.com/)
-

### p1

- integrate Google Gemini API (because it's the only one that's free)
- integrate other models and let the user purchase tokens
  - Stripe
- tool: text scaffolder (duplicates [this](https://www.magicschool.ai/tools/text-scaffolder-tool). This tool only outputs vocabulary and questions, it does NOT scaffold.)

### p0

- pages
  - account
  - settings
  - tools (lists all tools with a short description)
  - worksheets (lists all worksheets with a short description)
  - classes
- added: user can add a class
  - added: user is asked to assign each student a reading level by grade
- added: user can assign students to various groups
- worksheet: word search
- worksheet: scramble words
- worksheet: cloze
- worksheet: crossword
- worksheet: Custom (user picks and chooses which ones to include and the form is built dynamically to accommodate)
- worksheet: Vocabulary Hunt (uses the reading passage generator tool)
- tool: reading passage generator (similar to [this](https://www.magicschool.ai/tools/vocabulary-based-text-generator))
  - use morphological variations?
  - generate one for each student?
    - automatically set word count by the student's grade level
  - vocabulary input
  - topic input
  - length (only appears if **generate for each student** is unchecked)
  - grade level (only appears if **generate for each student** is unchecked)
  - generate comprehension questions?
- tool: Chromebook assigner by group/class/team
- tool: classroom jobs assigner by group/class/team
- tool: classroom clock (duplicates [Class Timers](https://mjf1406.github.io/class-timers/index.html))
- tool: randomize the order of the class by group
- tool: random picker
  - student
  - group
  - student from group
  - team
  - shuffle students (duplicates [Shuffle](https://mjf1406.github.io/various-classroom-tools/))
    - ensuring each student goes first and last before allowing anyone to go first or last again
- nav: hamburger nav with sections for
  - top aligned
    - classes
    - tools
    - worksheets
  - bottom aligned
    - account
    - settings

## Change Log
