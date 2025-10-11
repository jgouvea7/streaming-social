import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModuleIntegration } from '../src/app.test.module';

describe('Videos Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let videoId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/videos/upload - cria vídeo', async () => {
    const dto = { title: 'Video Teste' };

    const response = await request(app.getHttpServer())
      .post('/api/v1/videos/upload')
      .set('Authorization', `Bearer ${jwtToken}`)
      .field('title', dto.title)
      .attach('file', Buffer.from('conteudo'), 'video.mp4')
      .expect(201);

    expect(response.body).toHaveProperty("message", "Vídeo carregado com sucesso");
    expect(response.body).toHaveProperty("id");
    videoId = response.body.id
  });

  it('GET /api/v1/videos - lista vídeos', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/videos')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(0);
  });

  it('DELETE /api/v1/videos/:id - excluir video', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/videos/${videoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
    
    expect(response.body).toHaveProperty("message", "Vídeo deletado com sucesso")
  })
});
