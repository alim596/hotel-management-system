// src/bookings/schemas/reservation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ReservationDetail } from './reservation-detail.entity';

export enum ReservationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'CheckedIn',
  CHECKED_OUT = 'CheckedOut',
  CANCELLED = 'Cancelled',
  NO_SHOW = 'NoShow',
}

@Entity('Reservations')
@Index(['GuestID'])
@Index(['CheckInDate', 'CheckOutDate'])
@Index(['Status'])
export class Reservation {
  @PrimaryGeneratedColumn()
  ReservationID: number;

  @Column()
  GuestID: number;

  @CreateDateColumn()
  BookingDate: Date;

  @Column({ type: 'date' })
  CheckInDate: Date;

  @Column({ type: 'date' })
  CheckOutDate: Date;

  @Column({ type: 'int' })
  NumberOfGuests: number;

  @Column({ type: 'text', nullable: true })
  SpecialRequests: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  Status: ReservationStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  TotalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  DiscountAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  TaxAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  FinalAmount: number;

  @Column({ nullable: true })
  PromotionID: number;

  @Column({ type: 'timestamp', nullable: true })
  CancellationDate: Date;

  @Column({ type: 'text', nullable: true })
  CancellationReason: string;

  // Relationships
  @OneToMany(() => ReservationDetail, (detail) => detail.reservation)
  reservationDetails: ReservationDetail[];

  // Virtual properties
  get totalNights(): number {
    const diffTime = Math.abs(
      this.CheckOutDate.getTime() - this.CheckInDate.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isActive(): boolean {
    return [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN].includes(
      this.Status,
    );
  }
}
