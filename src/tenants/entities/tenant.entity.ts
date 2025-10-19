import { TelegramEntity } from 'src/telegram/entities/telegram.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
export class TenantsEntity {
  @PrimaryGeneratedColumn('uuid')
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @Column({ unique: true })
  domain: string;
  @Column()
  company_title: string;
  @Column()
  company_logo: string;
  @OneToMany(() => TelegramEntity, (tele) => tele.tenant, { cascade: true })
  chat_ids: TelegramEntity[];
  @Column({ nullable: true })
  phone: string;
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
