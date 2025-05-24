import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  BOOKING = 'Booking',
  PAYMENT = 'Payment',
  PROMOTION = 'Promotion',
  SYSTEM = 'System',
  REVIEW = 'Review',
  REMINDER = 'Reminder',
}

export enum NotificationPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('Notifications')
@Index(['UserID', 'IsRead'])
@Index(['Type'])
@Index(['CreatedAt'])
export class Notification {
  @PrimaryGeneratedColumn()
  NotificationID: number;

  @Column()
  UserID: number;

  @Column()
  Title: string;

  @Column('text')
  Message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  Type: NotificationType;

  @Column({ default: false })
  IsRead: boolean;

  @CreateDateColumn()
  CreatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  ReadAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  ExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  Priority: NotificationPriority;

  @Column({ type: 'varchar', length: 50, nullable: true })
  RelatedEntityType: string;

  @Column({ nullable: true })
  RelatedEntityID: number;

  // Virtual properties
  get isExpired(): boolean {
    if (!this.ExpiryDate) return false;
    return new Date() > this.ExpiryDate;
  }

  get priorityIcon(): string {
    switch (this.Priority) {
      case NotificationPriority.CRITICAL:
        return '🔴';
      case NotificationPriority.HIGH:
        return '🟠';
      case NotificationPriority.MEDIUM:
        return '🟡';
      case NotificationPriority.LOW:
        return '🟢';
      default:
        return '⚪';
    }
  }

  get typeIcon(): string {
    switch (this.Type) {
      case NotificationType.BOOKING:
        return '🏨';
      case NotificationType.PAYMENT:
        return '💰';
      case NotificationType.PROMOTION:
        return '🎉';
      case NotificationType.SYSTEM:
        return '⚙️';
      case NotificationType.REVIEW:
        return '⭐';
      case NotificationType.REMINDER:
        return '⏰';
      default:
        return '📢';
    }
  }
}
