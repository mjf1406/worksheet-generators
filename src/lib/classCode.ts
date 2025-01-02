import { db } from "~/server/db";
import { classes } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { Course } from "~/server/db/types";

type CharacterSet = {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  customChars?: string;
};

function generateCharacterPool(options: CharacterSet): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  
  let pool = '';
  
  if (options.uppercase) pool += uppercaseChars;
  if (options.lowercase) pool += lowercaseChars;
  if (options.numbers) pool += numberChars;
  if (options.customChars) pool += options.customChars;
  
  return pool || uppercaseChars; // Default to uppercase if no options selected
}

async function generateUniqueClassCode(
  length = 6,
  prefix = '',
  charOptions: CharacterSet = { uppercase: true, lowercase: true, numbers: true },
  maxAttempts = 10
): Promise<string> {
  const characters = generateCharacterPool(charOptions);
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate random code
    let code = prefix;
    const codeLength = length - prefix.length;
    
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    // Check if code exists in database using Drizzle syntax
    const existingClass = await db
      .select()
      .from(classes)
      .where(eq(classes.class_code, code));

    // If no class found with this code, return it
    if (existingClass.length === 0) {
      return code;
    }

    attempts++;
  }

  throw new Error(`Failed to generate unique class code after ${maxAttempts} attempts`);
}

export { generateUniqueClassCode };