import { TenantsEntity } from 'src/tenants/entities/tenant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenant_branches' })
export class TenantBranchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => TenantsEntity, (tenant) => tenant.branches)
  tenant: TenantsEntity;
  @Column()
  ar_name: string;
  @Column({ nullable: true })
  en_name: string;
  @Column()
  country: string;
  @Column()
  state: string;
  @Column()
  city: string;
  @Column()
  address_details: string;
  @Column({ nullable: true })
  tax_id: string;
  @Column({ nullable: true })
  tax_registry: string;
  @Column({ nullable: true })
  logo: string;
  @Column({ nullable: true })
  tax_branch_code: string;
  @Column({ type: 'int', nullable: true })
  user_num: number;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  OS: string;
  @Column({ nullable: true })
  version: string;
  @Column({ nullable: true })
  serial: string;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
