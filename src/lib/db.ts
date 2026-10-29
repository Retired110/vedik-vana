import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Handle Vercel serverless environment (where /var/task is read-only)
// Copy the database to writable /tmp so SQLite operations can write without error
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  const originalDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(originalDbPath)) {
        fs.copyFileSync(originalDbPath, tmpDbPath);
        try {
          fs.chmodSync(tmpDbPath, 0o666);
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to copy database to /tmp:', err);
    }
  }

  process.env.DATABASE_URL = `file:${tmpDbPath}`;
} else if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:.')) {
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
