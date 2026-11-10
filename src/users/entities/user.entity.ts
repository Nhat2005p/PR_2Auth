import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { USER_CONSTRAINTS } from '../constants/user.constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: USER_CONSTRAINTS.EMAIL_MAX_LENGTH })
  email: string;

  @Column({ length: USER_CONSTRAINTS.NAME_MAX_LENGTH })
  name: string;

  @Exclude()
  @Column({ length: USER_CONSTRAINTS.EMAIL_MAX_LENGTH })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
