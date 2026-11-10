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

export class RegisterDto {
  @ApiProperty({
    example: 'nhat@example.com',
    description: 'Địa chỉ email đăng ký',
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
    example: 'Minh Nhat',
    description: 'Họ và tên người dùng',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(USER_CONSTRAINTS.NAME_MAX_LENGTH, {
    message: `Tên tối đa ${USER_CONSTRAINTS.NAME_MAX_LENGTH} ký tự`,
  })
  name: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu (6 - 72 ký tự)',
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
