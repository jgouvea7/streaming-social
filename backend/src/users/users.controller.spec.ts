import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneByID: jest.fn(),
      update: jest.fn(),
      changePassword: jest.fn(),
      removeUserByID: jest.fn(),
      removeAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        bio: 'Bio',
        email: 'john@example.com',
        password: '123456',
        birthDate: new Date(),
      };

      service.create.mockResolvedValueOnce({ message: 'Usuário criado com sucesso' });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'Usuário criado com sucesso' });
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de usuários', async () => {
      const mockUsers = [{ id: '1', firstName: 'User1' }];
      service.findAll.mockResolvedValueOnce(mockUsers as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo ID', async () => {
      const user = { id: '1', firstName: 'John' };
      service.findOneByID.mockResolvedValueOnce(user as any);

      const result = await controller.findOne('1');

      expect(service.findOneByID).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('deve atualizar os dados do usuário', async () => {
      const dto: UpdateUserDto = { firstName: 'Jane' } as any;
      service.update.mockResolvedValueOnce({ message: 'Usuário alterado com sucesso' });

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual({ message: 'Usuário alterado com sucesso' });
    });
  });

  describe('updatePassword', () => {
    it('deve alterar a senha do usuário', async () => {
      const dto: UpdateUserDto = { password: 'novaSenha' } as any;
      service.changePassword.mockResolvedValueOnce({ message: 'Senha alterada com sucesso.' });

      const result = await controller.updatePassword('1', dto);

      expect(service.changePassword).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual({ message: 'Senha alterada com sucesso.' });
    });
  });

  describe('remove', () => {
    it('deve deletar um usuário pelo ID', async () => {
      service.removeUserByID.mockResolvedValueOnce({ message: 'Usuário deletado com sucesso' });

      const result = await controller.remove('1');

      expect(service.removeUserByID).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
    });
  });

  describe('removeAll', () => {
    it('deve deletar todos os usuários', async () => {
      service.removeAll.mockResolvedValueOnce({ message: 'Todos removidos' } as any);

      const result = await controller.removeAll();

      expect(service.removeAll).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Todos removidos' });
    });
  });
});
