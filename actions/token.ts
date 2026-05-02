'use server';

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function generateApiToken() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const token = crypto.randomBytes(32).toString('hex');
    
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { apiKey: token } },
      { new: true }
    );

    return { success: true, token };
  } catch (error) {
    console.error('Error generating token:', error);
    return { success: false, error: 'Failed to generate token' };
  }
}

export async function getApiToken() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();
    
    // Ensure user exists, if not maybe create
    let user = await User.findOne({ clerkId: userId });
    
    if (user && user.apiKey) {
      return { success: true, token: user.apiKey };
    }
    
    return { success: true, token: null };
  } catch (error) {
    console.error('Error getting token:', error);
    return { success: false, error: 'Failed to fetch token' };
  }
}
