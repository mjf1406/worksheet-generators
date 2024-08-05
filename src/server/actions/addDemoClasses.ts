"use server";

import insertClass, { type Data } from '~/server/actions/insertClass'
import { revalidatePath } from 'next/cache'
import type { StudentField } from '~/server/db/types'
import { LoremIpsum } from "lorem-ipsum";
import type { StudentId } from '~/server/actions/insertClass'
import updateStudentField from '~/server/actions/updateStudentField'
import { auth } from '@clerk/nextjs/server';

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
});
const sampleComments = [
{
    "level": "l1",
    "example": "- Struggles, and needs a lot of assistance, to solve word problems using CUBES.\n- Struggles, and needs a lot of assistance, to convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "reading": "- Can begin to find the main idea and key details with teacher assistance.\n- Can begin to identify Non Fiction text features.\n- Can begin to make connections from text to text, self and the world with teacher assistance.\n- Can begin to read own writing.\n- Can recognize simple words.\n- Next step is to continue reading books on RAZ Kids.",
    "writing": "- missing\n- for some\n- reason",
    "speaking": "- Can begin to use basic English in social situations.\n- Can respond to greetings with short phrases.\n- Can respond to simple questions with more than one-word answers.\n- Can participate orally in very basic classroom discussions with guidance.\n- Can express basic needs or conditions.\n- Next step is to listen to as much English content as possible.",
    "listening": "- Can follow one-step oral directions.\n- Can identify objects, figures, people from oral statements or questions.\n- Can match classroom oral language to daily routines.\n- Next step is to practice demonstrating appropriate attentive listening behaviours without constant teacher prompting.",
    "use_of_english": "-  Can begin to use an increasing range of present simple forms with teacher assistance.\n- Can begin to use past simple forms to describe routines, habits and states with teacher assistance.\n- Next step is to work hard at learning the grammar formulas and studying for the vocabulary and grammar tests.\n- Next step is to remember to use capital letters and correct punctuation.",
    "mathematics": "- Struggles, and needs a lot of assistance, to solve word problems using CUBES.\n- Struggles, and needs a lot of assistance, to convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "social_studies": "- Can read maps to locate the world’s hemispheres, continents, and oceans with much teacher support.\n- Struggled with the Social Studies assignment which impacted their score.\n- Next step is to put in greater effort in classwork and assignments to help improve understanding.",
    "science": "- Can name the planets in the solar system but not in order.\n- Can describe very few of the characteristics of the planets.\n- The planet brochure was not correctly done and brought their grade down. \n- Next step would be to learn the correct order of the planets."
},
{
    "level": "l2",
    "example": "- Struggles, and needs a lot of assistance, to solve word problems using CUBES.\n- Struggles, and needs a lot of assistance, to convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "reading": "- Can begin to find the main idea and key details.\n- Can begin to  identify Non Fiction text features.\n- Can begin to make connections from text to text, self and the world.\n- Can learn and share information from reading.\n- Can discuss characters and story events with guidance.\n- Next step is to practice reading English books at home.  \n- Next step is to continue reading books on RAZ Kids.",
    "writing": "- missing\n- for some\n- reason",
    "speaking": "- Can use English in social situations.\n- Can begin to respond to more complex questions.\n- Can express needs and give basic information independently.\n- Can ask simple, everyday questions.\n- Next step is to practice sharing basic social information with peers.\n- Next step is to listen to as much English content as possible.",
    "listening": "- Can follow two- to three-step oral directions.\n- Can evaluate oral information.\n- Can demonstrate appropriate attentive listening behaviours only with significant teacher prompting. \n- Next step is to practice demonstrating appropriate attentive listening behaviours.",
    "use_of_english": "-  Can begin to correctly use an increasing range of present simple forms to describe routines, habits and states.\n- Can begin to correctly use an increasing range of past simple forms to describe routines, habits and states.\n- Next step is to work hard at learning the grammar formulas and studying for the vocabulary and grammar tests.\n- Next step is to remember to use capital letters and correct punctuation.",
    "mathematics": "- Struggles, and needs a lot of assistance, to solve word problems using CUBES.\n- Struggles, and needs a lot of assistance, to convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "social_studies": "- Can read maps to locate the world’s hemispheres, continents, and oceans with much teacher support.\n- Struggled with the Social Studies assignment which impacted their score.\n- Next step is to put in greater effort in classwork and assignments to help improve understanding.",
    "science": "- Can name the planets in the solar system but not in order.\n- Can describe very few of the characteristics of the planets.\n- The planet brochure was not correctly done and brought their grade down. \n- Next step would be to learn the correct order of the planets."
},
{
    "level": "l3",
    "example": "- Can sometimes, or with assistance, solve word problems using CUBES.\n- Can sometimes, or with assistance, convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "reading": "- Can sometimes, or with assistance, find the main idea and key details.\n- Can sometimes, or with assistance,  identify Non Fiction text features.\n- Can sometimes, or with assistance, make connections from text to text, self and the world.\n- Can begin to read aloud with fluency.\n- Can summarize and retell story events in sequential order.\n- Next step is to continue reading books on RAZ Kids.\n- Next step is to practice reading aloud with fluency.",
    "writing": "- missing\n- for some\n- reason",
    "speaking": "- Can respond to more complex questions independently.\n- Can ask questions to clarify content and meaning.\n- Can begin to speak with confidence in front of a group.\n- Can answer simple content-based questions.\n- Can retell short stories or events.\n- Can orally engage in problem-solving. \n- Next step is to practice answering simple questions.\n- Next step is to practice retelling short stories or events.",
    "listening": "- Can follow multi-step oral directions occasionally with help.\n- Can demonstrate appropriate attentive listening behaviours with some teacher prompting.\n- Next step is to follow directions and instructions quickly without the teacher needing to repeat the instructions. \n- Next step is to practice demonstrating appropriate attentive listening behaviours at all times.",
    "use_of_english": "- Can sometimes, or with assistance, correctly use an increasing range of present simple forms. \n- Can sometimes, or with assistance,  correctly use an increasing range of past simple forms. \n- Next step is to work hard at learning the grammar formulas and studying for the vocabulary and grammar tests.\n- Next step is to do the Vocabulary and Grammar Kahoots as practice before the tests.",
    "mathematics": "- Can sometimes, or with assistance, solve word problems using CUBES.\n- Can sometimes, or with assistance, convert metric units using King Henry. \n- Next step is to practice using King Henry more effectively.\n- Next step is to practice using the strategy of CUBES.",
    "social_studies": "- Can sometimes, or with assistance, read maps to locate the world’s hemispheres, continents, and oceans.\n- Could have done better in the Social Studies assignment. \n- Next step is to put in greater effort in classwork and assignments to help improve understanding.",
    "science": "- Can sometimes, or with assistance, explain the difference between orbit and rotation. \n- Can sometimes, or with assistance, name the planets in the solar system in order.\n- Next step would be to use the target ‘space’  vocabulary more frequently."
},
{
    "level": "l4",
    "example": "- Can solve word problems using CUBES.\n- Knows which clue words are related to what maths operation.\n- Can convert metric units using King Henry. \n- Can identify greater than, less than and equal to.\n - Next step is to create their own word problems.",
    "reading": "- Can mostly figure out what information is important.\n- Can mostly find the main idea and key details.\n- Can mostly  identify Non Fiction text features.\n- Can mostly make connections from text to text, self and the world.\n- Can choose reading materials at the appropriate level. \n- Next step is to practice reading English books at home.  \n- Next step is to practice reading aloud with expression.",
    "writing": "- missing\n- for some\n- reason",
    "speaking": "- Can show confidence when speaking in front of a group.\n- Can answer opinion questions with supporting details.\n- Can discuss stories, issues, and concepts.\n- Can give content-based oral reports.\n- Can offer creative solutions to issues/problems.\n- Next step is to practice answering opinion questions with supporting details.\n- Next step is to practice discussing stories.",
    "listening": "- Can interpret oral information and apply it to situations.\n- Can follow multi-step oral directions.\n- Can demonstrate appropriate attentive listening behaviours with minimal teacher prompting. \n- Next step is to follow directions and instructions quickly without the teacher needing to repeat the instructions. \n- Next step is to practice demonstrating appropriate attentive listening behaviours at all times.",
    "use_of_english": "- Can correctly use an increasing range of present simple forms.\n- Can correctly use modal forms.\n- Can correctly use an increasing range of past simple forms.\n- Can correctly use present perfect forms to express what has happened with for and since.\n- Next step is to start using their grammar points in their writing.",
    "mathematics": "- Can solve word problems using CUBES.\n- Knows which clue words are related to what maths operation.\n- Can convert metric units using King Henry. \n- Can identify greater than, less than and equal to.\n - Next step is to create their own word problems.",
    "social_studies": "- Can read maps and globes to locate the world’s hemispheres, continents, and oceans. \n- Can compare and contrast between Korea and another country.\n- Did very well in their Social Studies assignment.\n- Next step would be to compare another country.",
    "science": "- Can explain the difference between orbit and rotation. \n- Can name the planets in the solar system in order.\n- Knows the solar system is a group of planets orbiting a star.  \n- Did a wonderful job on their planet brochure.\n- Next step would be to independently inquire further into other areas of interest you may have about space."
},
{
    "level": "l5",
    "example": "- Can solve word problems using CUBES.\n- Knows which clue words are related to what maths operation.\n- Can convert metric units using King Henry. \n- Can identify greater than, less than and equal to.\n - Next step is to create their own word problems.",
    "reading": "- Can find the main idea and key details.\n- Can  identify Non Fiction text features.\n- Can make connections from text to text, self and the world.\n- Can ask questions to help them understand what they are reading.\n- Can read aloud with fluency, expression, and confidence. \n- Next step would be to stretch themselves by reading more complex books at home.",
    "writing": "- missing\n- for some\n- reason",
    "speaking": "- Can participate and communicate competently in all subject areas.\n- Can speak English with near-native fluency; any hesitation does not interfere with communication.\n- Can vary speech appropriately using intonation and stress independently.\n- Can ask questions to develop ideas and extend understanding.",
    "listening": "- Can carry out oral instructions containing grade level, content-based language.\n- Can demonstrate appropriate attentive listening behaviours independently. \n- Can follow multi-step oral directions.\n- Next step is to follow directions and instructions quickly without the teacher needing to repeat the instructions.",
    "use_of_english": "- Can correctly use an increasing range of present simple forms.\n- Can correctly use modal forms.\n- Can correctly use an increasing range of past simple forms.\n- Can correctly use present perfect forms to express what has happened with for and since.\n- Next step is to start using their grammar points in their writing.",
    "mathematics": "- Can solve word problems using CUBES.\n- Knows which clue words are related to what maths operation.\n- Can convert metric units using King Henry. \n- Can identify greater than, less than and equal to.\n - Next step is to create their own word problems.",
    "social_studies": "- Can read maps and globes to locate the world’s hemispheres, continents, and oceans. \n- Can compare and contrast between Korea and another country.\n- Did very well in their Social Studies assignment.\n- Next step would be to compare another country.",
    "science": "- Can explain the difference between orbit and rotation. \n- Can name the planets in the solar system in order.\n- Knows the solar system is a group of planets orbiting a star.  \n- Did a wonderful job on their planet brochure.\n- Next step would be to independently inquire further into other areas of interest you may have about space."
}
]
function generateSkill(complete: boolean): string {
const options = ["", "", "", "", "AB", "CD", "P", "NY"];
let randomIndex
if (complete) {
    randomIndex = Math.floor(Math.random() * options.length);
    while (randomIndex === 0 || randomIndex === 1 || randomIndex === 2 || randomIndex === 3) {
    randomIndex = Math.floor(Math.random() * options.length);
    }
} else randomIndex = Math.floor(Math.random() * options.length);
return String(options[randomIndex]);
}
function generateSubjectAchievementScore(complete: boolean): string {
const options = ["", "", "", "", "1", "2", "3", "4", "5"];
let randomIndex
if (complete) {
    randomIndex = Math.floor(Math.random() * options.length);
    while (randomIndex === 0 || randomIndex === 1 || randomIndex === 2 || randomIndex === 3) {
    randomIndex = Math.floor(Math.random() * options.length);
    }
} else randomIndex = Math.floor(Math.random() * options.length);
return String(options[randomIndex]);
}
function generateFields(complete: boolean): StudentField {
const listeningS1 = generateSubjectAchievementScore(complete)
const listeningS2 = generateSubjectAchievementScore(complete)
const mathematicsS1 = generateSubjectAchievementScore(complete)
const mathematicsS2 = generateSubjectAchievementScore(complete)
const readingS1 = generateSubjectAchievementScore(complete)
const readingS2 = generateSubjectAchievementScore(complete)
const scienceS1 = generateSubjectAchievementScore(complete)
const scienceS2 = generateSubjectAchievementScore(complete)
const social_studiesS1 = generateSubjectAchievementScore(complete)
const social_studiesS2 = generateSubjectAchievementScore(complete)
const speakingS1 = generateSubjectAchievementScore(complete)
const speakingS2 = generateSubjectAchievementScore(complete)
const use_of_englishS1 = generateSubjectAchievementScore(complete)
const use_of_englishS2 = generateSubjectAchievementScore(complete)
const writingS1 = generateSubjectAchievementScore(complete)
const writingS2 = generateSubjectAchievementScore(complete)

return {
    field_id: "",
    student_id: "",
    collaboration: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    communication: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    inquiry: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    listening: {
    s1: listeningS1,
    s2: listeningS2,
    s1_comment: sampleComments.find(i => i.level === `l${listeningS1}`)?.listening,
    s2_comment: sampleComments.find(i => i.level === `l${listeningS2}`)?.listening
    },
    mathematics: {
    s1: mathematicsS1,
    s2: mathematicsS2,
    s1_comment: sampleComments.find(i => i.level === `l${mathematicsS1}`)?.mathematics,
    s2_comment: sampleComments.find(i => i.level === `l${mathematicsS2}`)?.mathematics
    },
    open_minded: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    organization: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    reading: {
    s1: readingS1,
    s2: readingS2,
    s1_comment: sampleComments.find(i => i.level === `l${readingS1}`)?.reading,
    s2_comment: sampleComments.find(i => i.level === `l${readingS2}`)?.reading
    },
    responsibility: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    risk_taking: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    science: {
    s1: scienceS1,
    s2: scienceS2,
    s1_comment: sampleComments.find(i => i.level === `l${scienceS1}`)?.science,
    s2_comment: sampleComments.find(i => i.level === `l${scienceS2}`)?.science
    },
    social_studies: {
    s1: social_studiesS1,
    s2: social_studiesS2,
    s1_comment: sampleComments.find(i => i.level === `l${social_studiesS1}`)?.social_studies,
    s2_comment: sampleComments.find(i => i.level === `l${social_studiesS2}`)?.social_studies
    },
    speaking: {
    s1: speakingS1,
    s2: speakingS2,
    s1_comment: sampleComments.find(i => i.level === `l${speakingS1}`)?.speaking,
    s2_comment: sampleComments.find(i => i.level === `l${speakingS2}`)?.speaking
    },
    thinking: {
    s1: generateSkill(complete),
    s2: generateSkill(complete),
    },
    use_of_english: {
    s1: use_of_englishS1,
    s2: use_of_englishS2,
    s1_comment: sampleComments.find(i => i.level === `l${use_of_englishS1}`)?.use_of_english,
    s2_comment: sampleComments.find(i => i.level === `l${use_of_englishS2}`)?.use_of_english
    },
    writing: {
    s1: writingS1,
    s2: writingS2,
    s1_comment: sampleComments.find(i => i.level === `l${writingS1}`)?.writing,
    s2_comment: sampleComments.find(i => i.level === `l${writingS2}`)?.writing
    },
    comment: { 
    s1: lorem.generateParagraphs(4), 
    s2: lorem.generateParagraphs(4)
    },
} as StudentField
}
function generateStudentFieldData(complete: boolean, studentIds: StudentId){
const fields = generateFields(complete)
return {
    ...fields,
    student_id: studentIds.sid,
    field_id: studentIds.fid,
} as StudentField
}
const currentYear = new Date().getFullYear()
const completeClassDemo: Data = {
  class_id: undefined,
  class_name: "Demo, Complete",
  class_language: 'en',
  class_grade: '5',
  class_year: String(currentYear),
  role: 'primary',
  fileContents: `number,sex,name_ko,name_en
1,f,이지현,Lee Jihyun
2,m,박민수,Park Minsu
3,f,김수정,Kim Sujeong
4,m,이현우,Lee Hyunwoo
5,m,정우성,Jung Woosung
6,f,최수연,Choi Suyeon
7,f,오누리,Oh Nuri
8,m,김민준,Kim Minjun
`,
}
const incompleteClassDemo: Data = {
  class_id: undefined,
  class_name: "Demo, Incomplete",
  class_language: 'en',
  class_grade: '5',
  class_year: String(currentYear),
  role: 'primary',
  fileContents: `number,sex,name_ko,name_en
1,f,김유진,Kim Yujin
2,m,이도현,Lee Dohyun
3,f,박민지,Park Minji
4,m,최준영,Choi Junyoung
5,m,한동훈,Han Donghoon
6,f,정하나,Jung Hana
7,f,윤서연,Yoon Seoyeon
8,m,류재민,Ryu Jaemin
`,
}
export default async function addDemoClasses() {
    const { userId } = auth()
    if (!userId) throw new Error("User not authenticated:")
    // Insert complete demo class
    const completeStudentIds: string = await insertClass(completeClassDemo, userId, true) 
    const completeStudentIdsJson: StudentId[] = JSON.parse(completeStudentIds) as StudentId[]
    const completeData = completeStudentIdsJson.map(student => {
      return generateStudentFieldData(true, student)
    })
    await updateStudentField(completeData)
    
    // Insert incomplete demo class
    const incompleteStudentIds: string = await insertClass(incompleteClassDemo, userId, false) 
    const incompleteStudentIdsJson: StudentId[] = JSON.parse(incompleteStudentIds) as StudentId[]
    const incompleteData = incompleteStudentIdsJson.map(student => {
      return generateStudentFieldData(false, student)
    })
    await updateStudentField(incompleteData)

    revalidatePath("/classes")
}