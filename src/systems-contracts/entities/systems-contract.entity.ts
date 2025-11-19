import { ContractEntity } from 'src/contracts/entities/contract.entity';
import { SystemEntity } from 'src/systems/entities/system.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'systems_contracts' })
export class SystemsContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @ManyToOne(() => SystemEntity, (sys) => sys.contracts)
  system: SystemEntity;
  @Column({ type: 'decimal', default: 0 })
  system_price: number;
  @ManyToOne(() => ContractEntity, (sys) => sys.systems)
  contract: ContractEntity;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
