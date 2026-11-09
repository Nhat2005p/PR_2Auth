import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    email: 'nhat@example.com',
    name: 'Minh Nhat',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockRedisService = {
    setBlacklistToken: jest.fn(),
    isTokenBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'nhat@example.com',
        name: 'Minh Nhat',
        password: '123456',
      });

      expect(result.email).toBe('nhat@example.com');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'nhat@example.com',
          name: 'Minh Nhat',
          password: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token-sample');

      const result = await authService.login({
        email: 'nhat@example.com',
        password: '123456',
      });

      expect(result.accessToken).toBe('jwt-token-sample');
      expect(result.user.email).toBe('nhat@example.com');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        authService.login({
          email: 'nhat@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should store token in Redis blacklist', async () => {
      mockJwtService.decode.mockReturnValue({
        sub: 1,
        email: 'nhat@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const result = await authService.logout('jwt-token-sample');

      expect(mockRedisService.setBlacklistToken).toHaveBeenCalled();
      expect(result.message).toBe('Đăng xuất thành công');
    });
  });
});
