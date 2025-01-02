"use server";

import { auth, clerkClient } from '@clerk/nextjs/server'; // Clerk authentication and client
import { google } from 'googleapis';
import { db } from '../db';
import { student_classes, students } from '../db/schema'; // Import students schema
import { eq } from 'drizzle-orm'; // Import eq from Drizzle ORM
import { NextResponse } from 'next/server';
import { APP_NAME } from '~/lib/constants';

// Removed the unused GoogleTokens interface

export async function sendEmails(input: { classId: string }) {
  const { classId } = input;

  // Validate input
  if (!classId) {
    throw new Error('Missing classId.');
  }

  const { userId } = auth();

  // Check authentication
  if (!userId) {
    throw new Error('Unauthorized.');
  }

  const clerkResponse = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google');
  const accessToken = clerkResponse.data[0]?.token;

  if (!accessToken) {
    return NextResponse.json({ message: "Failed to retrieve Google OAuth token" }, { status: 401 });
  }
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: accessToken });

  // Initialize Gmail client
  const gmailClient = google.gmail({ version: 'v1', auth: authClient });

  // Fetch student records for the given class
  const studentRecords = await db
    .select()
    .from(student_classes)
    .leftJoin(students, eq(student_classes.student_id, students.student_id))
    .where(eq(student_classes.class_id, classId))
    .execute();

  if (!studentRecords || studentRecords.length === 0) {
    throw new Error('No students found for this class.');
  }

  // Function to create a raw email in base64url format
  const createRawEmail = (to: string, classId: string, studentId: string): string => {
    const dashboardUrl = `https://www.classquest.app/classes/${classId}/students/${studentId}`;
    const emailContent = [
      `To: ${to}`,
      'Content-Type: text/html; charset=UTF-8',
      `Subject: Your ${APP_NAME} Dashboard`,
      '',
      `<p>Hey there, ${APP_NAME}er!</p>
       <p>Do NOT share this link with anyone! Also, please add the below link to your Bookmarks bar so you can easily access it later.</p>
       <p>Please access your dashboard using the link below:</p>
       <a href="${dashboardUrl}">Go to your ${APP_NAME} Dashboard</a>`,
    ].join('\n');

    return Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Prepare email sending promises with enhanced error handling
  const sendEmailPromises: Promise<void>[] = studentRecords.map((record) => {
    const email = record.students?.student_email;
    const studentId = record.student_classes.student_id;

    if (!email) {
      console.warn(`Email not found for student ID ${studentId}. Skipping.`);
      return Promise.resolve(); // Skip sending email if email is missing
    }

    const raw = createRawEmail(email, classId, studentId);
    return gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    })
    .then(() => undefined) // Ensure the promise resolves to void
    .catch((error) => {
      console.error(`Failed to send email to ${email}:`, error);
      // Optionally, collect failed emails for further processing
    });
  });

  // Execute all email sending promises with concurrency control
  const CONCURRENT_LIMIT = 5; // Adjust based on Gmail API rate limits

  const executeWithConcurrency = async (promises: Promise<void>[], limit: number) => {
    const results: Promise<void>[] = [];
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const p = promise.then(() => undefined); // Ensure each promise resolves to void
      results.push(p);

      if (limit <= promises.length) {
        const e = p;
        executing.push(e);
        if (executing.length >= limit) {
          await Promise.race(executing);
          // Remove the settled promise from executing array
          const index = executing.findIndex((ex) => ex === e);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          if (index > -1) executing.splice(index, 1);
        }
      }
    }

    return Promise.all(results);
  };

  try {
    await executeWithConcurrency(sendEmailPromises, CONCURRENT_LIMIT);
    console.log('All emails have been processed.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('An error occurred while sending emails:', error.message);
    } else {
      console.error('An unknown error occurred while sending emails:', error);
    }
    throw new Error('Some emails could not be sent.');
  }
}
