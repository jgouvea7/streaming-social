import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideosService } from 'src/videos/videos.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let repo: jest.Mocked<Repository<Comment>>;
  let videosService: jest.Mocked<VideosService>;

  const mockVideo = { id: '1', title: 'video' };
  const mockComment = { id: '10', comment: 'teste', video: mockVideo, user: { id: '123' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: VideosService,
          useValue: {
            findVideoByID: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    repo = module.get(getRepositoryToken(Comment));
    videosService = module.get(VideosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar um comentário com sucesso', async () => {
      const videoID = '1';
      const userID = '123';
      const createDto = { comment: 'teste' };

      videosService.findVideoByID.mockResolvedValue(mockVideo as any);
      repo.create.mockReturnValue(mockComment);
      repo.save.mockResolvedValue(mockComment);

      const result = await service.create(videoID, userID, createDto);

      expect(videosService.findVideoByID).toHaveBeenCalledWith(videoID);
      expect(repo.create).toHaveBeenCalledWith({
        video: mockVideo,
        user: { id: userID },
        comment: 'teste',
      });
      expect(repo.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual({
        message: 'Comentário publicado com sucesso',
        id: mockComment.id,
      });
    });

    it('deve lançar NotFoundException se o vídeo não existir', async () => {
      const videoID = '99';
      const userID = '123';
      const createDto = { comment: 'teste' };

      videosService.findVideoByID.mockResolvedValue(null);
      await expect(service.create(videoID, userID, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCommentById', () => {
    it('deve retornar o comentário', async () => {
      repo.findOneBy.mockResolvedValue(mockComment);
      const result = await service.findCommentById('10');
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '10' });
      expect(result).toEqual(mockComment);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findCommentById('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCommentById', () => {
    it('deve atualizar o comentário se o usuário for dono', async () => {
      const userID = '123';
      const updateDto = { comment: 'novo' };

      repo.findOne.mockResolvedValue({ ...mockComment } as any);
      repo.save.mockResolvedValue({ ...mockComment, comment: 'novo', edited: true } as any);

      const result = await service.updateCommentById('10', userID, updateDto);

      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Comentario alterado com sucesso' });
    });

    it('deve lançar ForbiddenException se usuário não for dono', async () => {
      const userID = '999';
      repo.findOne.mockResolvedValue({ ...mockComment } as any);

      await expect(service.updateCommentById('10', userID, { comment: 'novo' })).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se comentário não existir', async () => {
      const userID = '123';
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateCommentById('99', userID, { comment: 'novo' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLikeComment', () => {
    it('deve atualizar o like do comentário', async () => {
      const updateDto = { likeCount: 5 };
      repo.findOneBy.mockResolvedValue(mockComment);
      repo.save.mockResolvedValue({ ...mockComment, likeCount: 5 });

      await service.updateLikeComment('10', updateDto);
      expect(repo.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.updateLikeComment('10', { likeCount: 5 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o comentário', async () => {
      repo.findOneBy.mockResolvedValue(mockComment);
      repo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove('10');
      expect(repo.delete).toHaveBeenCalledWith('10');
      expect(result).toEqual({ message: 'Comentário deletado com sucesso' });
    });

    it('deve lançar NotFoundException se não existir', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove('10')).rejects.toThrow(NotFoundException);
    });
  });
});
