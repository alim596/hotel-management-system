import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Hotel } from '../../hotels/schemas/hotel.entity';

export enum StaffRole {
  MANAGER = 'Manager',
  RECEPTIONIST = 'Receptionist',
  HOUSEKEEPER = 'Housekeeper',
  MAINTENANCE = 'Maintenance',
  CONCIERGE = 'Concierge',
}

export enum ShiftType {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  NIGHT = 'Night',
  FLEXIBLE = 'Flexible',
}

@Entity('HotelStaff')
@Index(['HotelID'])
@Index(['Role'])
export class HotelStaff {
  @PrimaryGeneratedColumn()
  StaffID: number;

  @Column({ unique: true })
  UserID: number;

  @Column()
  HotelID: number;

  @Column({
    type: 'enum',
    enum: StaffRole,
  })
  Role: StaffRole;

  @Column({
    type: 'enum',
    enum: ShiftType,
    default: ShiftType.FLEXIBLE,
  })
  ShiftType: ShiftType;

  @Column({ type: 'date', nullable: true })
  JoinDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  EmployeeID: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'text', nullable: true })
  Notes: string;

  @Column({ type: 'json', nullable: true })
  Certifications: string[];

  @Column({ type: 'json', nullable: true })
  Languages: string[];

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: 'UserID' })
  user: User;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'HotelID' })
  hotel: Hotel;

  // Virtual properties
  get roleIcon(): string {
    switch (this.Role) {
      case StaffRole.MANAGER:
        return '👔';
      case StaffRole.RECEPTIONIST:
        return '🏢';
      case StaffRole.HOUSEKEEPER:
        return '🧹';
      case StaffRole.MAINTENANCE:
        return '🔧';
      case StaffRole.CONCIERGE:
        return '🎩';
      default:
        return '👤';
    }
  }

  get shiftIcon(): string {
    switch (this.ShiftType) {
      case ShiftType.MORNING:
        return '🌅';
      case ShiftType.AFTERNOON:
        return '🌞';
      case ShiftType.NIGHT:
        return '🌙';
      case ShiftType.FLEXIBLE:
        return '⚡';
      default:
        return '⏰';
    }
  }

  get yearsOfService(): number {
    if (!this.JoinDate) return 0;
    const diff = new Date().getTime() - this.JoinDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  get hasMultipleLanguages(): boolean {
    return this.Languages && this.Languages.length > 1;
  }
}
