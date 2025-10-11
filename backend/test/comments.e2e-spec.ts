import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModuleIntegration } from '../src/app.test.module';

describe('Comments Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let videoId: string;
  let commentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleIntegration],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userDto = {
      firstName: 'Jonnathas',
      lastName: 'Gouvea',
      username: 'jonnathas',
      email: 'test@test.com',
      password: '@Teste123',
      birthDate: '1997-12-12',
    };

    await request(app.getHttpServer()).post('/api/v1/users').send(userDto);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: userDto.email, password: userDto.password });

    jwtToken = loginRes.body.access_token;

    const videoResponse = await request(app.getHttpServer())
      .post('/api/v1/videos/upload')
      .set('Authorization', `Bearer ${jwtToken}`)
      .field('title', 'Video Teste')
      .attach('file', Buffer.from('conteudo'), 'video.mp4')
      .expect(201);

    videoId = videoResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/comments/:id - cria comentário', async () => {
    const dto = { comment: 'Comentário de teste' };
    const response = await request(app.getHttpServer())
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Comentário publicado com sucesso');
    expect(response.body).toHaveProperty('id');
    commentId = response.body.id;
  });

  it('PATCH /api/v1/comments/:id - atualiza comentário', async () => {
    const dto = { comment: 'Comentário atualizado' };
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/comments/${commentId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Comentario alterado com sucesso');
  });

  it('DELETE /api/v1/comments/:id - remove comentário', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/comments/${commentId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Comentário deletado com sucesso');
  });
});
