import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  const mockCommentsService = {
    create: jest.fn(),
    updateCommentById: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = { user: { sub: 'user123' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService) as jest.Mocked<CommentsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um comentário com sucesso', async () => {
      const dto: CreateCommentDto = { comment: 'teste' };
      const expected = { message: 'Comentário publicado com sucesso' };

      service.create.mockResolvedValue(expected);

      const result = await controller.create('video123', mockRequest, dto);

      expect(service.create).toHaveBeenCalledWith('video123', 'user123', dto);
      expect(result).toEqual(expected);
    });

    it('deve lançar erro se o CommentsService lançar uma exceção', async () => {
      const dto: CreateCommentDto = { comment: 'erro' };
      service.create.mockRejectedValue(new Error('Video não encontrado'));

      await expect(controller.create('video99', mockRequest, dto)).rejects.toThrow('Video não encontrado');
      expect(service.create).toHaveBeenCalledWith('video99', 'user123', dto);
    });
  });

  describe('update', () => {
    it('deve atualizar o comentário com sucesso', async () => {
      const dto: UpdateCommentDto = { comment: 'atualizado' };
      const expected = { message: 'Comentario alterado com sucesso' };

      service.updateCommentById.mockResolvedValue(expected);

      const result = await controller.update('1', mockRequest, dto);

      expect(service.updateCommentById).toHaveBeenCalledWith('1', 'user123', dto);
      expect(result).toEqual(expected);
    });

    it('deve lançar erro se o CommentsService lançar exceção', async () => {
      const dto: UpdateCommentDto = { comment: 'falha' };
      service.updateCommentById.mockRejectedValue(new Error('Comentário não encontrado'));

      await expect(controller.update('1', mockRequest, dto)).rejects.toThrow('Comentário não encontrado');
      expect(service.updateCommentById).toHaveBeenCalledWith('1', 'user123', dto);
    });
  });

  describe('remove', () => {
    it('deve remover o comentário com sucesso', async () => {
      const expected = { message: 'Comentário deletado com sucesso' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(expected);
    });

    it('deve lançar erro se o CommentsService lançar exceção', async () => {
      service.remove.mockRejectedValue(new Error('Comentário não encontrado'));

      await expect(controller.remove('1')).rejects.toThrow('Comentário não encontrado');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
