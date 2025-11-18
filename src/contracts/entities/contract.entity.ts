import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractStatusEntity } from './contract-status.entity';
import { ContractStatusEnum } from 'src/utils/types/enums/contract-status.enum';
import { AttachmentEntity } from 'src/attachments/entities/attachment.entity';
import { SystemsContractEntity } from 'src/systems-contracts/entities/systems-contract.entity';
import { PotentialCustomerEntity } from 'src/potential-customers/entities/potential-customer.entity';
import { ServiceEntity } from 'src/services/entities/service.entity';

@Entity({ name: 'contracts' })
export class ContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @OneToMany(() => ContractStatusEntity, (status) => status.contract, {
    cascade: true,
  })
  status_history: ContractStatusEntity[];
  @ManyToMany(() => ServiceEntity, (serv) => serv.contracts, {
    cascade: true,
  })
  @JoinTable()
  services: ServiceEntity[];
  @OneToMany(() => AttachmentEntity, (att) => att.contract, {
    cascade: true,
  })
  attachments: AttachmentEntity[];
  @OneToMany(() => SystemsContractEntity, (sc) => sc.contract, {
    cascade: true,
  })
  systems: SystemsContractEntity[];
  @ManyToOne(() => PotentialCustomerEntity, (cust) => cust.contracts)
  customer: PotentialCustomerEntity;
  @Column({
    type: 'enum',
    enum: ContractStatusEnum,
    default: ContractStatusEnum.PENDING,
  })
  curr_status: ContractStatusEnum;
  @Column({ type: 'decimal', nullable: true })
  discount: number;
  @Column({ type: 'decimal', nullable: true })
  vat: number;
  @Column({ type: 'decimal', nullable: true })
  w_tax: number;
  @Column({ type: 'decimal' })
  total_price: number;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
