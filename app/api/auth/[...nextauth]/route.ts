/**
 * NextAuth API Route Handler
 * 
 * Handles all authentication requests.
 * Route: /api/auth/[...nextauth]
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/infrastructure/auth/nextAuthOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
