import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SystemFeaturesEntity } from './system-features.entity';
import { SystemsContractEntity } from 'src/systems-contracts/entities/systems-contract.entity';

@Entity({ name: 'systems' })
export class SystemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @OneToMany(() => SystemFeaturesEntity, (fea) => fea.system, {
    cascade: true,
  })
  features: SystemFeaturesEntity[];
  @OneToMany(() => SystemsContractEntity, (sc) => sc.system, {
    cascade: true,
  })
  contracts: SystemsContractEntity[];
  @Column()
  name: string;
  @Column()
  desc: string;
  @Column({ type: 'decimal' })
  price: number;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
