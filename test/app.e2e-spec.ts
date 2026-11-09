import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/hello (GET) - Default English', () => {
    return request(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/hello?lang=vi (GET) - Vietnamese', () => {
    return request(app.getHttpServer())
      .get('/api/hello?lang=vi')
      .expect(200)
      .expect('Xin chào thế giới!');
  });

  afterEach(async () => {
    await app.close();
  });
});
