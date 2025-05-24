// src/shared/entities/guest.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum MembershipLevel {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
}

@Entity('Guests')
@Index(['LoyaltyPoints'])
export class Guest {
  @PrimaryGeneratedColumn()
  GuestID: number;

  @Column({ unique: true })
  UserID: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Nationality: string;

  @Column({ type: 'varchar', length: 50, default: 'English' })
  PreferredLanguage: string;

  @Column({ type: 'int', default: 0 })
  LoyaltyPoints: number;

  @Column({
    type: 'enum',
    enum: MembershipLevel,
    default: MembershipLevel.BRONZE,
  })
  MembershipLevel: MembershipLevel;

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: 'UserID' })
  user: User;

  // Virtual properties
  get membershipBenefits(): string[] {
    switch (this.MembershipLevel) {
      case MembershipLevel.PLATINUM:
        return [
          'Free WiFi',
          'Late Checkout',
          'Room Upgrade',
          'Free Breakfast',
          'Concierge Service',
        ];
      case MembershipLevel.GOLD:
        return ['Free WiFi', 'Late Checkout', 'Room Upgrade', 'Free Breakfast'];
      case MembershipLevel.SILVER:
        return ['Free WiFi', 'Late Checkout', 'Room Upgrade'];
      case MembershipLevel.BRONZE:
      default:
        return ['Free WiFi'];
    }
  }

  get discountRate(): number {
    switch (this.MembershipLevel) {
      case MembershipLevel.PLATINUM:
        return 0.15;
      case MembershipLevel.GOLD:
        return 0.1;
      case MembershipLevel.SILVER:
        return 0.05;
      case MembershipLevel.BRONZE:
      default:
        return 0.02;
    }
  }
}
