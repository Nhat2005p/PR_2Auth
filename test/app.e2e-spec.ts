import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { RedisService } from '../src/redis/redis.service';

describe('App & Auth Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  // Mock RedisService cho test e2e để độc lập với Redis server bên ngoài
  const mockBlacklist = new Set<string>();
  const mockRedisService = {
    setBlacklistToken: jest.fn().mockImplementation(async (token: string) => {
      mockBlacklist.add(`blacklist:${token}`);
    }),
    isTokenBlacklisted: jest.fn().mockImplementation(async (token: string) => {
      return mockBlacklist.has(`blacklist:${token}`);
    }),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.dropDatabase();
    }
    await app.close();
  });

  it('/api/hello (GET) - default English', () => {
    return request(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/auth/register (POST) - register new user (handles email normalization)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: '  Nhat@Example.COM  ',
        name: 'Minh Nhat',
        password: 'password123',
      })
      .expect(201);

    expect(res.body.email).toBe('nhat@example.com');
    expect(res.body.name).toBe('Minh Nhat');
    expect(res.body.password).toBeUndefined();
  });

  it('/api/auth/register (POST) - reject duplicate email with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'nhat@example.com',
        name: 'Minh Nhat Duplicate',
        password: 'password123',
      })
      .expect(409);
  });

  it('/api/auth/login (POST) - login and receive JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'NHAT@EXAMPLE.COM',
        password: 'password123',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it('/api/auth/login (POST) - reject wrong password with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nhat@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/api/auth/login (POST) - reject non-existing email with 401 (timing-safe)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'password123',
      })
      .expect(401);
  });

  it('/api/auth/me (GET) - get current user with valid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe('nhat@example.com');
    expect(res.body.password).toBeUndefined();
  });

  it('/api/auth/logout (POST) - logout and blacklist token in Redis', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.message).toBeDefined();
    expect(mockRedisService.setBlacklistToken).toHaveBeenCalled();
  });

  it('/api/auth/me (GET) - reject blacklisted token after logout with 401', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
