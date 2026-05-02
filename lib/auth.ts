import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function authenticateRequest(request: Request) {
  try {
    // 1. Check API Token from standard auth or arbitrary matching header
    const tokenHeader = request.headers.get('Authorization') || request.headers.get('x-api-key') || '';
    const token = tokenHeader.replace(/^Bearer\s+/, '').trim();

    if (token) {
      await connectDB();
      const user = await User.findOne({ apiKey: token }).lean();
      
      if (user) {
        return { userId: user.clerkId, authMethod: 'token' };
      }
    }

    // 2. Fallback to extracting it from arbitrary headers (for users testing with arbitrary header names in tools)
    let anyHeaderToken = '';
    request.headers.forEach((value) => {
      // Find a token format if they just pasted a 64 char hex string or similar
      // Just check if the exact string matches an apiKey in the DB
      if (value.length > 20 && value.length < 100 && !anyHeaderToken) {
        anyHeaderToken = value;
      }
    });

    if (anyHeaderToken) {
      await connectDB();
      const user = await User.findOne({ apiKey: anyHeaderToken }).lean();
      if (user) return { userId: user.clerkId, authMethod: 'token' };
    }

    // 3. Fallback to Clerk Session Auth
    const clerkAuth = await auth();
    if (clerkAuth && clerkAuth.userId) {
      return { userId: clerkAuth.userId, authMethod: 'session' };
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
