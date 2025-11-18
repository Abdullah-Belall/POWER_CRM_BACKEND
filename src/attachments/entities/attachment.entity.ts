import { ContractEntity } from 'src/contracts/entities/contract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'attachment' })
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @ManyToOne(() => ContractEntity, (cont) => cont.attachments)
  contract: ContractEntity;
  @Column()
  title: string;
  @Column({ nullable: true })
  note: string;
  @Column()
  end_point: string;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
