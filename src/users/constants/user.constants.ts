export const USER_CONSTRAINTS = {
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 72, // bcrypt chỉ xử lý tối đa 72 bytes
} as const;
