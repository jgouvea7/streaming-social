import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModuleIntegration } from '../src/app.test.module';
import { jwtDecode } from 'jwt-decode';


describe('Likes Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;
  let videoId: string;
  let commentId: string;

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

    const videoResponse = await request(app.getHttpServer())
      .post('/api/v1/videos/upload')
      .set('Authorization', `Bearer ${jwtToken}`)
      .field('title', 'Video Teste')
      .attach('file', Buffer.from('conteudo'), 'video.mp4')
      .expect(201);
    
    videoId = videoResponse.body.id;

    const commentRes = await request(app.getHttpServer())
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ videoID: videoId, comment: 'Comentário teste' })
      .expect(201);

    commentId = commentRes.body.id;
    
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/videos/:id/like - like/unlike vídeo', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/videos/${videoId}/like`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201);
  });

  it('POST /api/v1/comments/:id/like - like/unlike comentário', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/comments/${commentId}/like`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201);
  });
});
