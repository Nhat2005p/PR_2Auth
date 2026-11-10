import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test trước khi bất kỳ module/file nào được import
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Đảm bảo process.env đã có giá trị test
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqljs';
process.env.DB_DATABASE = 'test.sqlite';
process.env.JWT_SECRET = 'test-e2e-jwt-secret-key-123456789';
