import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', async () => {
    const expectedEmail = 'test12356@test.com';
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: expectedEmail, password: '3456345634563456dfsdfg' })
      .expect(201);
    const { id, email } = res.body;
    expect(id).toBeDefined();
    expect(email).toEqual(expectedEmail);
  });
});
