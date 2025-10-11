import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('deve retornar um access_token válido quando as credenciais estiverem corretas', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      const mockToken = 'jwt_token';
      const email = 'test@example.com';
      const password = '123456';

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.singIn(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.singIn(email, password)).rejects.toThrow(UnauthorizedException);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const email = 'notfound@example.com';
      const password = '123456';

      await expect(service.singIn(email, password)).rejects.toThrow();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });
});
