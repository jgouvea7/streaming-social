import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    singIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('singIn', () => {
    it('deve retornar o access_token quando o login for bem-sucedido', async () => {
      const singInDto = { email: 'test@example.com', password: '123456' };
      const mockToken = { access_token: 'jwt_token' };

      mockAuthService.singIn.mockResolvedValue(mockToken);

      const result = await controller.singIn(singInDto);

      expect(authService.singIn).toHaveBeenCalledWith(singInDto.email, singInDto.password);
      expect(result).toEqual(mockToken);
    });

    it('deve propagar o erro se o AuthService lançar uma exceção', async () => {
      const singInDto = { email: 'wrong@example.com', password: 'wrongpass' };
      mockAuthService.singIn.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.singIn(singInDto)).rejects.toThrow('Invalid credentials');
      expect(authService.singIn).toHaveBeenCalledWith(singInDto.email, singInDto.password);
    });
  });
});
