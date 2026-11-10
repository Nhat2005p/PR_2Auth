import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUsersTable1700000000000 } from './migrations/1700000000000-CreateUsersTable';

export const getDataSourceOptions = (): DataSourceOptions => {
  const dbType = process.env.DB_TYPE || 'mysql';

  if (dbType === 'sqljs') {
    return {
      type: 'sqljs',
      location: process.env.DB_DATABASE || 'database.sqlite',
      autoSave: true,
      entities: [User],
      migrations: [CreateUsersTable1700000000000],
      synchronize: false,
    };
  }

  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'nestjs_tutorial',
    entities: [User],
    migrations: [CreateUsersTable1700000000000],
    synchronize: false,
  };
};

export const dataSourceOptions: DataSourceOptions = getDataSourceOptions();

const AppDataSource = new DataSource(getDataSourceOptions());
export default AppDataSource;
