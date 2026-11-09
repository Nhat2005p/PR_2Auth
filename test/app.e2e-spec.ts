import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

describe('App & Auth Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_DATABASE = 'test.sqlite';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  it('/api/auth/register (POST) - register new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'nhat@example.com',
        name: 'Minh Nhat',
        password: '123456',
      })
      .expect(201);

    expect(res.body.email).toBe('nhat@example.com');
    expect(res.body.name).toBe('Minh Nhat');
    expect(res.body.password).toBeUndefined();
  });

  it('/api/auth/login (POST) - login and receive JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nhat@example.com',
        password: '123456',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
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

    expect(res.body.message).toBe('Đăng xuất thành công');
  });

  it('/api/auth/me (GET) - reject blacklisted token after logout', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
