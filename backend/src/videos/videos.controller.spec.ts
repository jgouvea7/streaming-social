import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

describe('VideosController', () => {
  let controller: VideosController;
  let service: jest.Mocked<VideosService>;

  const mockVideosService = {
    postVideo: jest.fn(),
    findAll: jest.fn(),
    findVideoByID: jest.fn(),
    updateVideoByID: jest.fn(),
    removeVideoByID: jest.fn(),
    removeAll: jest.fn(),
  };

  const mockRequest = { user: { sub: 'user123' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [{ provide: VideosService, useValue: mockVideosService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VideosController>(VideosController);
    service = module.get(VideosService) as jest.Mocked<VideosService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadVideo', () => {
    it('deve enviar um vídeo com sucesso', async () => {
      const dto: CreateVideoDto = { title: 'Video Teste' };
      const mockFile = { originalname: 'teste.mp4' } as any;

      service.postVideo.mockResolvedValue({ message: 'Video carregado com sucesso' });

      const result = await controller.uploadVideo(mockFile, dto, mockRequest);

      expect(service.postVideo).toHaveBeenCalledWith(dto, mockFile, 'user123');
      expect(result).toEqual({ message: 'Video carregado com sucesso' });
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os vídeos', async () => {
      const videos = [{ id: '1', title: 'Video 1' }];
      service.findAll.mockResolvedValueOnce(videos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(videos);
    });
  });

  describe('findVideoById', () => {
    it('deve retornar um vídeo pelo ID', async () => {
      const video = { id: '1', title: 'Video Teste' };
      service.findVideoByID.mockResolvedValueOnce(video);

      const result = await controller.findVideoById('1'); // só passa o id

      expect(service.findVideoByID).toHaveBeenCalledWith('1'); // verifica apenas o id
      expect(result).toEqual(video);
    });
  });

  describe('updateVideoById', () => {
    it('deve atualizar um vídeo pelo ID', async () => {
      const dto: UpdateVideoDto = { title: 'Novo Título' };
      const updated = { id: '1', title: 'Novo Título' };

      service.updateVideoByID.mockResolvedValueOnce(updated);

      const result = await controller.updateVideoById('1', mockRequest, dto);

      expect(service.updateVideoByID).toHaveBeenCalledWith('1', 'user123', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('removeVideoById', () => {
    it('deve remover um vídeo pelo ID', async () => {
      const deleted = { deleted: true };
      service.removeVideoByID.mockResolvedValueOnce(deleted);

      const result = await controller.removeVideoById('1', mockRequest);

      expect(service.removeVideoByID).toHaveBeenCalledWith('1', 'user123');
      expect(result).toEqual(deleted);
    });
  });

  describe('removeAll', () => {
    it('deve remover todos os vídeos', async () => {
      service.removeAll.mockResolvedValueOnce({ deletedCount: 10 });

      const result = await controller.removeAll();

      expect(service.removeAll).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 10 });
    });
  });
});
