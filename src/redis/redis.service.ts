import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private memoryBlacklist = new Map<string, number>();

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
      retryStrategy: () => null,
    });

    this.client.on('error', () => {
      // Fallback sang in-memory khi máy local chưa bật Redis server
    });
  }

  async setBlacklistToken(token: string, ttlSeconds: number): Promise<void> {
    const key = `blacklist:${token}`;
    const ttl = Math.max(ttlSeconds, 1);

    try {
      await this.client.set(key, '1', 'EX', ttl);
    } catch {
      this.memoryBlacklist.set(key, Date.now() + ttl * 1000);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;

    try {
      const result = await this.client.get(key);
      if (result) {
        return true;
      }
    } catch {
      // Ignore Redis connection error and check memory fallback
    }

    const expiresAt = this.memoryBlacklist.get(key);
    if (!expiresAt) {
      return false;
    }

    if (Date.now() > expiresAt) {
      this.memoryBlacklist.delete(key);
      return false;
    }

    return true;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status === 'ready') {
      await this.client.quit();
    } else {
      this.client.disconnect();
    }
  }
}
