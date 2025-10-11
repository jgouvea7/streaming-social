import { Test, TestingModule } from '@nestjs/testing';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/auth/auth.guard';

describe('LikesController', () => {
  let controller: LikesController;
  let service: jest.Mocked<LikesService>;

  const mockLikesService = {
    videoLike: jest.fn(),
    commentLike: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<LikesController>(LikesController);
    service = module.get(LikesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleVideoLike', () => {
    it('deve chamar LikesService.videoLike com sucesso', async () => {
      const req = { user: { sub: 'u1' } };
      const videoId = 'v1';
      service.videoLike.mockResolvedValue(undefined);

      const result = await controller.toggleVideoLike(req, videoId);

      expect(service.videoLike).toHaveBeenCalledWith('u1', 'v1');
      expect(result).toBeUndefined();
    });

    it('deve propagar erro se LikesService.videoLike lançar exceção', async () => {
      const req = { user: { sub: 'u1' } };
      const videoId = 'v1';
      service.videoLike.mockRejectedValue(new Error('Vídeo não encontrado'));

      await expect(controller.toggleVideoLike(req, videoId)).rejects.toThrow('Vídeo não encontrado');
    });
  });

  describe('toggleCommentLike', () => {
    it('deve chamar LikesService.commentLike com sucesso', async () => {
      const req = { user: { sub: 'u1' } };
      const commentId = 'c1';
      service.commentLike.mockResolvedValue(undefined);

      const result = await controller.toggleCommentLike(req, commentId);

      expect(service.commentLike).toHaveBeenCalledWith('u1', 'c1');
      expect(result).toBeUndefined();
    });

    it('deve propagar erro se LikesService.commentLike lançar exceção', async () => {
      const req = { user: { sub: 'u1' } };
      const commentId = 'c1';
      service.commentLike.mockRejectedValue(new Error('Comentário não encontrado'));

      await expect(controller.toggleCommentLike(req, commentId)).rejects.toThrow('Comentário não encontrado');
    });
  });
});
