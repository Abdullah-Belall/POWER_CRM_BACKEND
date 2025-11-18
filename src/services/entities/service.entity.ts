import { ContractEntity } from 'src/contracts/entities/contract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @ManyToMany(() => ContractEntity, (contract) => contract.services)
  contracts: ContractEntity[];
  @Column()
  title: string;
  @Column()
  desc: string;
  @Column({ type: 'decimal' })
  price: number;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
