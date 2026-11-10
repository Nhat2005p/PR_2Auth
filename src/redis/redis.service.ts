import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    this.client = new Redis({
      host,
      port,
      lazyConnect: false,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        this.logger.warn(
          `Redis disconnected. Reconnecting attempt #${times} in ${delay}ms`,
        );
        return delay;
      },
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack);
    });
  }

  async setBlacklistToken(token: string, ttlSeconds: number): Promise<void> {
    const key = `blacklist:${token}`;
    const ttl = Math.max(ttlSeconds, 1);

    try {
      await this.client.set(key, '1', 'EX', ttl);
    } catch (err) {
      this.logger.error(
        `Failed to blacklist token in Redis: ${err.message}`,
        err.stack,
      );
      const message = this.i18n.t('auth.redis_service_unavailable');
      throw new ServiceUnavailableException(message);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;

    try {
      const result = await this.client.get(key);
      return result !== null;
    } catch (err) {
      this.logger.error(
        `Failed to verify token in Redis blacklist: ${err.message}`,
        err.stack,
      );
      const message = this.i18n.t('auth.redis_service_unavailable');
      throw new ServiceUnavailableException(message);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.client.status === 'ready') {
        await this.client.quit();
      } else {
        this.client.disconnect();
      }
    } catch (err) {
      this.logger.warn(`Error disconnecting Redis: ${err.message}`);
    }
  }
}
