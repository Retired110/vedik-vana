import { PrismaClient } from '@prisma/client';
import path from 'path';

// Ensure DATABASE_URL is set and resolves correctly in both local and Vercel serverless environments
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:.')) {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
