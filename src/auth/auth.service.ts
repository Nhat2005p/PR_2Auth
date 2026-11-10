import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// DUMMY_HASH để ngăn chặn timing attacks (timing attack mitigation)
// Được tính trước bằng bcrypt.hashSync('dummy_password_timing_attack', 10)
const DUMMY_HASH =
  '$2a$10$wT5YwYm8p3XQk7n.fIuL0O5G7d4G6rU9uE1mYvS5yD7x0A3C2B1A2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly i18n: I18nService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const normalizedEmail = registerDto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.email_in_use'));
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      email: normalizedEmail,
      name: registerDto.name.trim(),
      password: hashedPassword,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error: any) {
      // Bắt lỗi trùng unique key từ Database (MySQL: ER_DUP_ENTRY / 1062, SQLite: SQLITE_CONSTRAINT)
      if (
        error?.code === 'ER_DUP_ENTRY' ||
        error?.errno === 1062 ||
        error?.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(this.i18n.t('auth.email_in_use'));
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: User }> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    // So sánh với hash thật nếu tìm thấy user, hoặc so sánh với DUMMY_HASH để thời gian phản hồi đồng nhất
    const passwordToCompare = user ? user.password : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      passwordToCompare,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user,
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode(token) as JwtPayload | null;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds =
      decoded && decoded.exp ? Math.max(decoded.exp - nowInSeconds, 1) : 86400;

    await this.redisService.setBlacklistToken(token, ttlSeconds);

    return {
      message: this.i18n.t('auth.logout_success'),
    };
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
