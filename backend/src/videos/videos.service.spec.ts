import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('VideosService', () => {
  let service: VideosService;
  let repo: jest.Mocked<Repository<Video>>;
  let usersService: jest.Mocked<UsersService>;

  const mockVideo: Video = {
    id: '1',
    title: 'Video Teste',
    url: '/uploads/videos/test.mp4',
    edited: false,
    user: { id: '123' },
  } as any;

  const mockFile = { filename: 'test.mp4' } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: getRepositoryToken(Video),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
            deleteAll: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByID: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
    repo = module.get(getRepositoryToken(Video));
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('postVideo', () => {
    it('deve criar e salvar um vídeo com sucesso', async () => {
      const createDto = { title: 'Video 1' } as any;
      const userID = '123';
      const mockUser = { id: userID, username: 'user' };

      usersService.findOneByID.mockResolvedValueOnce(mockUser as any);
      repo.create.mockReturnValueOnce(mockVideo);
      repo.save.mockResolvedValueOnce(mockVideo);

      const result = await service.postVideo(createDto, mockFile, userID);

      expect(usersService.findOneByID).toHaveBeenCalledWith(userID);
      expect(repo.create).toHaveBeenCalledWith({
        title: 'Video 1',
        user: mockUser,
        edited: false,
        url: '/uploads/videos/test.mp4',
      });
      expect(repo.save).toHaveBeenCalledWith(mockVideo);
      expect(result).toEqual({
        message: 'Vídeo carregado com sucesso',
        id: mockVideo.id,
      });
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      usersService.findOneByID.mockResolvedValueOnce(null as any);
      const dto = { title: 'Video 1' } as any;
      const userID = '404';

      await expect(service.postVideo(dto, mockFile, userID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVideoByID', () => {
    it('deve atualizar e salvar vídeo se usuário for dono', async () => {
      const userID = '123';
      repo.findOne.mockResolvedValueOnce(mockVideo);
      repo.save.mockResolvedValueOnce({ ...mockVideo, edited: true, title: 'Novo título' });

      const result = await service.updateVideoByID('1', userID, { title: 'Novo título' } as any);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result.edited).toBe(true);
    });

    it('deve lançar ForbiddenException se usuário não for dono', async () => {
      const userID = '999';
      repo.findOne.mockResolvedValueOnce(mockVideo);

      await expect(service.updateVideoByID('1', userID, {} as any)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se vídeo não existir', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateVideoByID('404', '123', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeVideoByID', () => {
    it('deve deletar vídeo se usuário for dono', async () => {
      const userID = '123';
      repo.findOne.mockResolvedValueOnce(mockVideo);
      repo.delete.mockResolvedValueOnce({ affected: 1 } as any);

      const result = await service.removeVideoByID('1', userID);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Vídeo deletado com sucesso' });
    });

    it('deve lançar ForbiddenException se usuário não for dono', async () => {
      const userID = '999';
      repo.findOne.mockResolvedValueOnce(mockVideo);

      await expect(service.removeVideoByID('1', userID)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se vídeo não existir', async () => {
      const userID = '123';
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.removeVideoByID('404', userID)).rejects.toThrow(NotFoundException);
    });
  });
});
