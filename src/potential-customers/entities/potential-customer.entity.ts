import { ContractEntity } from 'src/contracts/entities/contract.entity';
import { DiscussionEntity } from 'src/discussions/entities/discussion.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'potential_customers' })
export class PotentialCustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @ManyToOne(() => UserEntity, (user) => user.potential_customeres_assignments)
  assigner: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.potential_customeres)
  saler: UserEntity;
  @Column({ type: 'int' })
  index: number;
  @OneToMany(() => DiscussionEntity, (dis) => dis.customer, {
    cascade: true,
  })
  discussions: DiscussionEntity[];
  @OneToMany(() => ContractEntity, (cont) => cont.customer, {
    cascade: true,
  })
  contracts: ContractEntity[];
  @Column({
    type: 'enum',
    enum: PotentialCustomerStatus,
    default: PotentialCustomerStatus.PENDING,
  })
  status: PotentialCustomerStatus;
  @Column()
  name: string;
  @Column({ nullable: true })
  company: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  note: string;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
