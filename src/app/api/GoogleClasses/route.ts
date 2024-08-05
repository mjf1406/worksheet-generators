import { auth, clerkClient } from '@clerk/nextjs/server';
import { google, type classroom_v1 } from 'googleapis';
import { type NextRequest, NextResponse } from 'next/server';

async function fetchStudents(classroomClient: classroom_v1.Classroom, courseId: string) {
  try {
    const res = await classroomClient.courses.students.list({
      courseId: courseId,
    });
    return res.data.students ?? [];
  } catch (error) {
    console.error(`Failed to fetch students for course ${courseId}:`, error);
    return []; // Return an empty array if there's an error
  }
}

// Handler function to handle the API route
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
  
    if (!userId) {
      return NextResponse.json({ message: "User is not authenticated" }, { status: 401 });
    }
  
    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google');
    
    const accessToken = clerkResponse.data[0]?.token;
  
    // Set up Google OAuth2 client with the access token
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
  
    // Initialize the Classroom client
    const classroomClient: classroom_v1.Classroom = google.classroom({ version: 'v1', auth: authClient });
  
    try {
      const coursesResponse = await classroomClient.courses.list({});
      if (!coursesResponse.data || !coursesResponse.data.courses) {
        return NextResponse.json({ message: 'No courses found' }, { status: 404 });
      }

      // Fetch students for each course
      const courses = await Promise.all(coursesResponse.data.courses.map(async (course) => {
        const students = await fetchStudents(classroomClient, course.id!);
        return {
          ...course,
          students: students,
        };
      }));

      return NextResponse.json(courses);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to fetch classroom data:', error);
      return NextResponse.json({ message: 'Failed to fetch classroom data', error: error.message }, { status: 500 });
    }
  } catch (err) {
    const error = err as Error;
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Unexpected error', error: error.message }, { status: 500 });
  }
}
