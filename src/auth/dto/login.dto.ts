import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { USER_CONSTRAINTS } from '../../users/constants/user.constants';

export class LoginDto {
  @ApiProperty({
    example: 'nhat@example.com',
    description: 'Địa chỉ email đăng nhập',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(USER_CONSTRAINTS.EMAIL_MAX_LENGTH, {
    message: `Email tối đa ${USER_CONSTRAINTS.EMAIL_MAX_LENGTH} ký tự`,
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(USER_CONSTRAINTS.PASSWORD_MIN_LENGTH, {
    message: `Mật khẩu phải có ít nhất ${USER_CONSTRAINTS.PASSWORD_MIN_LENGTH} ký tự`,
  })
  @MaxLength(USER_CONSTRAINTS.PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu không được vượt quá ${USER_CONSTRAINTS.PASSWORD_MAX_LENGTH} ký tự`,
  })
  password: string;
}
