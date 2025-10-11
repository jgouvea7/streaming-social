import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { VideosService } from 'src/videos/videos.service';
import { CommentsService } from 'src/comments/comments.service';
import { NotFoundException } from '@nestjs/common';

describe('LikesService', () => {
  let service: LikesService;
  let repo: jest.Mocked<Repository<Like>>;
  let usersService: jest.Mocked<UsersService>;
  let videosService: jest.Mocked<VideosService>;
  let commentsService: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: getRepositoryToken(Like),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: { findOneByID: jest.fn() },
        },
        {
          provide: VideosService,
          useValue: { findVideoByID: jest.fn(), updateLikeVideo: jest.fn() },
        },
        {
          provide: CommentsService,
          useValue: { findCommentById: jest.fn(), updateLikeComment: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    repo = module.get(getRepositoryToken(Like));
    usersService = module.get(UsersService);
    videosService = module.get(VideosService);
    commentsService = module.get(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('videoLike', () => {
    it('deve adicionar like a um vídeo', async () => {
      const user = { id: 'u1' };
      const video = { id: 'v1', likeCount: 0 };
      
      usersService.findOneByID.mockResolvedValue(user);
      videosService.findVideoByID.mockResolvedValue(video);
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({} as any);
      repo.save.mockResolvedValue({} as any);

      await service.videoLike('u1', 'v1');

      expect(usersService.findOneByID).toHaveBeenCalledWith('u1');
      expect(videosService.findVideoByID).toHaveBeenCalledWith('v1');
      expect(repo.create).toHaveBeenCalledWith({ user, video });
      expect(repo.save).toHaveBeenCalled();
      expect(videosService.updateLikeVideo).toHaveBeenCalledWith('v1', { likeCount: 1 });
    });

    it('deve remover like existente de um vídeo', async () => {
      const user = { id: 'u1' };
      const video = { id: 'v1', likeCount: 2 };
      const existingLike = { id: 'like1' };

      usersService.findOneByID.mockResolvedValue(user);
      videosService.findVideoByID.mockResolvedValue(video);
      repo.findOne.mockResolvedValue(existingLike);

      await service.videoLike('u1', 'v1');

      expect(repo.remove).toHaveBeenCalledWith(existingLike);
      expect(videosService.updateLikeVideo).toHaveBeenCalledWith('v1', { likeCount: 1 });
    });

    it('deve lançar NotFoundException se usuário ou vídeo não existir', async () => {
      usersService.findOneByID.mockResolvedValue(null);
      videosService.findVideoByID.mockResolvedValue({ id: 'v1' });

      await expect(service.videoLike('u1', 'v1')).rejects.toThrow(NotFoundException);

      usersService.findOneByID.mockResolvedValue({ id: 'u1' });
      videosService.findVideoByID.mockResolvedValue(null);

      await expect(service.videoLike('u1', 'v1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('commentLike', () => {
    it('deve adicionar like a um comentário', async () => {
      const user = { id: 'u1' };
      const comment = { id: 'c1', likeCount: 0 };

      usersService.findOneByID.mockResolvedValue(user);
      commentsService.findCommentById.mockResolvedValue(comment);
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({} as any);
      repo.save.mockResolvedValue({} as any);

      await service.commentLike('u1', 'c1');

      expect(usersService.findOneByID).toHaveBeenCalledWith('u1');
      expect(commentsService.findCommentById).toHaveBeenCalledWith('c1');
      expect(repo.create).toHaveBeenCalledWith({ user, comment });
      expect(repo.save).toHaveBeenCalled();
      expect(commentsService.updateLikeComment).toHaveBeenCalledWith('c1', { likeCount: 1 });
    });

    it('deve remover like existente de um comentário', async () => {
      const user = { id: 'u1' };
      const comment = { id: 'c1', likeCount: 2 };
      const existingLike = { id: 'like1' };

      usersService.findOneByID.mockResolvedValue(user);
      commentsService.findCommentById.mockResolvedValue(comment);
      repo.findOne.mockResolvedValue(existingLike);

      await service.commentLike('u1', 'c1');

      expect(repo.remove).toHaveBeenCalledWith(existingLike);
      expect(commentsService.updateLikeComment).toHaveBeenCalledWith('c1', { likeCount: 1 });
    });

    it('deve lançar NotFoundException se usuário ou comentário não existir', async () => {
      usersService.findOneByID.mockResolvedValue(null);
      commentsService.findCommentById.mockResolvedValue({ id: 'c1' });

      await expect(service.commentLike('u1', 'c1')).rejects.toThrow(NotFoundException);

      usersService.findOneByID.mockResolvedValue({ id: 'u1' });
      commentsService.findCommentById.mockResolvedValue(null);

      await expect(service.commentLike('u1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
