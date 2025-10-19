import { TenantsEntity } from 'src/tenants/entities/tenant.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'telegram_chat_ids' })
export class TelegramEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column()
  chat_id: string;
  @ManyToOne(() => TenantsEntity, (tenant) => tenant.chat_ids)
  tenant: TenantsEntity;
  @OneToOne(() => UserEntity, (user) => user.chat_id)
  user: UserEntity;
  @Column({ type: 'boolean', default: true })
  active: boolean;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
