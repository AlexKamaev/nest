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

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'asdfasdf@sdfgsdfg.com';

    const res = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: '34563asdfaksdhfkajhsdf4'})
    .expect(201);

    const cookie = res.get('Set-Cookie') as string[];

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

      expect(body.email).toEqual(email);
  });
});
