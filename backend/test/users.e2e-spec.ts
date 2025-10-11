import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModuleIntegration } from '../src/app.test.module';
import { jwtDecode } from 'jwt-decode';

describe('Users Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleIntegration],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        firstName: 'Jonnathas',
        lastName: 'Gouvea',
        username: 'jonnathas',
        email: 'test@test.com',
        password: '@Teste123',
        birthDate: '1997-12-12',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: '@Teste123' })
      .expect(200);

    jwtToken = loginRes.body.access_token;
    const decoded: any = jwtDecode(jwtToken);
    userId = decoded.sub;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/users - lista usuários', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/users/:id - atualiza usuário', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/update-user/${userId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ firstName: 'Joana' })
      .expect(200);

    expect(response.body).toHaveProperty("message", "Usuário alterado com sucesso");
  });

  it('DELETE /api/vi/users/:id - excluir usuário', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
    expect(response.body).toHaveProperty("message", "Usuário deletado com sucesso")
  })
});
