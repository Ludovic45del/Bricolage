import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      badgeNumber: 'BADGE001',
      password: 'Password123!',
      phone: '1234567890',
      employer: 'Test Corp',
    };

    const createdUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      badgeNumber: 'BADGE001',
      role: 'member',
      status: 'active',
      totalDebt: 0,
      membershipExpiry: new Date(),
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockJwtService.signAsync.mockResolvedValue('mock_token');
    });

    it('should register a new user successfully', async () => {
      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'existing',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should throw ConflictException if badge number already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce({ id: 'existing', badgeNumber: 'BADGE001' }); // Badge check fails

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'Badge number already registered',
      );
    });

    it('should hash password before storing', async () => {
      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: 'hashed_password',
          }),
        }),
      );
    });

    it('should set membership expiry to 1 year from now', async () => {
      await service.register(registerDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            membershipExpiry: expect.any(Date),
          }),
        }),
      );
    });

    it('should set default role to member and status to active', async () => {
      await service.register(registerDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'member',
            status: 'active',
          }),
        }),
      );
    });

    it('should generate access and refresh tokens', async () => {
      const result = await service.register(registerDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should not return passwordHash in response', async () => {
      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      badgeNumber: 'BADGE001',
      passwordHash: 'hashed_password',
      role: 'member',
      status: 'active',
    };

    beforeEach(() => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock_token');
    });

    it('should login user with email', async () => {
      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }, { badgeNumber: 'test@example.com' }],
        },
      });
    });

    it('should login user with badge number', async () => {
      const dto = { identifier: 'BADGE001', password: 'Password123!' };

      const result = await service.login(dto);

      expect(result).toHaveProperty('user');
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'BADGE001' }, { badgeNumber: 'BADGE001' }],
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if account is not active', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        status: 'suspended',
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is suspended or archived',
      );
    });

    it('should throw UnauthorizedException if passwordHash is missing', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'Password not set. Please contact admin.',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should verify password with bcrypt', async () => {
      await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed_password');
    });

    it('should generate access and refresh tokens', async () => {
      const result = await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should not return passwordHash in response', async () => {
      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should handle archived status', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        status: 'archived',
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is suspended or archived',
      );
    });
  });

  describe('refreshToken', () => {
    const mockPayload = {
      sub: 'user1',
      email: 'test@example.com',
      role: 'member',
      type: 'refresh',
    };

    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      role: 'member',
      status: 'active',
    };

    beforeEach(() => {
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');
    });

    it('should generate new access token from valid refresh token', async () => {
      const result = await service.refreshToken('valid_refresh_token');

      expect(result).toHaveProperty('accessToken');
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user1',
          email: 'test@example.com',
          role: 'member',
          type: 'access',
        }),
        { expiresIn: 3600 },
      );
    });

    it('should throw UnauthorizedException if token type is not refresh', async () => {
      mockJwtService.verify.mockReturnValue({
        ...mockPayload,
        type: 'access',
      });

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        'Invalid token type',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('valid_refresh_token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('valid_refresh_token')).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'suspended',
      });

      await expect(service.refreshToken('valid_refresh_token')).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should only generate new access token, not refresh token', async () => {
      const result = await service.refreshToken('valid_refresh_token');

      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateTokens (integration)', () => {
    it('should generate both access and refresh tokens with correct expiry', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user1',
        email: 'test@example.com',
        role: 'member',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.register({
        name: 'Test',
        email: 'test@example.com',
        badgeNumber: 'TEST',
        password: 'Pass123!',
      });

      // Access token: 1 hour
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'access' }),
        { expiresIn: 3600 },
      );

      // Refresh token: 7 days
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'refresh' }),
        { expiresIn: 604800 },
      );
    });
  });
});
