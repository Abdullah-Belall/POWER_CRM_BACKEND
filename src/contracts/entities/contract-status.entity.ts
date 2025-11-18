import { ContractStatusEnum } from 'src/utils/types/enums/contract-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContractEntity } from './contract.entity';

@Entity({ name: 'contract_status' })
export class ContractStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => ContractEntity, (con) => con.status_history)
  contract: ContractEntity;
  @Column({ type: 'enum', enum: ContractStatusEnum })
  status: ContractStatusEnum;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
