import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('SupportMessages')
export class SupportMessage {
  @PrimaryGeneratedColumn()
  MessageID: number;

  @Column()
  UserID: number;

  @Column()
  Subject: string;

  @Column('text')
  Content: string;

  @Column({ nullable: true })
  Category: string;

  @Column({ nullable: true })
  Priority: string;

  @Column({ default: 'Open' })
  Status: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;

  @Column({ nullable: true })
  AssignedTo: number;

  @Column({ type: 'text', nullable: true })
  Resolution: string;
}
