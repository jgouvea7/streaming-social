import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Test bio',
    password: 'hashedpassword',
    birthDate: new Date(),
    role: 'user',
    videos: [],
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      repo.findOneBy.mockResolvedValueOnce(null); // email
      repo.findOneBy.mockResolvedValueOnce(null); // username
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      repo.save.mockResolvedValueOnce(mockUser);

      const result = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        bio: 'bio',
        email: 'john@example.com',
        password: '123456',
        birthDate: new Date(),
      });

      expect(result).toEqual({ message: 'Usuário criado com sucesso' });
      expect(repo.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 12);
    });

    it('deve lançar erro se email já estiver cadastrado', async () => {
      repo.findOneBy.mockResolvedValueOnce(mockUser);

      await expect(
        service.create({
          email: 'john@example.com',
          username: 'newuser',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se username já estiver cadastrado', async () => {
      repo.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(
        service.create({
          email: 'new@example.com',
          username: 'johndoe',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      repo.find.mockResolvedValueOnce([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repo.find).toHaveBeenCalledWith({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          birthDate: true,
          role: true,
        },
        relations: { videos: true },
      });
    });
  });

  describe('findOneByID', () => {
    it('deve retornar o usuário', async () => {
      repo.findOneBy.mockResolvedValueOnce(mockUser);
      const result = await service.findOneByID('1');
      expect(result).toBe(mockUser);
    });

    it('deve lançar erro se não encontrar', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.findOneByID('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário com sucesso', async () => {
      repo.findOneBy.mockResolvedValueOnce(mockUser);
      repo.save.mockResolvedValueOnce(mockUser);

      const result = await service.update('1', { firstName: 'Jane' } as any);
      expect(result).toEqual({ message: 'Usuário alterado com sucesso' });
      expect(repo.save).toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.update('2', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('deve alterar a senha com sucesso', async () => {
      repo.findOneBy.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('newhash');
      repo.save.mockResolvedValueOnce(mockUser);

      const result = await service.changePassword('1', { password: 'novaSenha' } as any);
      expect(result).toEqual({ message: 'Senha alterada com sucesso.' });
      expect(repo.save).toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(
        service.changePassword('2', { password: '123' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUserByID', () => {
    it('deve deletar o usuário com sucesso', async () => {
      repo.findOneBy.mockResolvedValueOnce(mockUser);
      repo.delete.mockResolvedValueOnce(undefined as any);

      const result = await service.removeUserByID('1');
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.removeUserByID('2')).rejects.toThrow(NotFoundException);
    });
  });
});
