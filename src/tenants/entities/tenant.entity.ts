import { TelegramEntity } from 'src/telegram/entities/telegram.entity';
import { TenantBranchEntity } from 'src/tenant-branches/entities/tenant-branch.entity';
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
  @OneToMany(() => TelegramEntity, (tele) => tele.tenant, { cascade: true })
  chat_ids: TelegramEntity[];
  @OneToMany(() => TenantBranchEntity, (branch) => branch.tenant, {
    cascade: true,
  })
  branches: TenantBranchEntity[];
  @Column({ unique: true })
  domain: string;
  @Column()
  company_title: string;
  @Column({ default: '' })
  company_logo: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
