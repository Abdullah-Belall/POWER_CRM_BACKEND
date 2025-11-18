import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SystemEntity } from './system.entity';

@Entity({ name: 'system_features' })
export class SystemFeaturesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => SystemEntity, (sys) => sys.features)
  system: SystemEntity;
  @Column()
  title: string;
  @Column()
  details: string;
  @CreateDateColumn()
  created_at: Date;
}
