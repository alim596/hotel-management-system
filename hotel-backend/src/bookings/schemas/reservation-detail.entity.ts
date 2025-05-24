// src/bookings/schemas/reservation-detail.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('ReservationDetails')
@Index(['ReservationID'])
@Index(['RoomID', 'CheckInDate', 'CheckOutDate'])
export class ReservationDetail {
  @PrimaryGeneratedColumn()
  ReservationDetailID: number;

  @Column()
  ReservationID: number;

  @Column()
  RoomID: number;

  @Column({ type: 'date' })
  CheckInDate: Date;

  @Column({ type: 'date' })
  CheckOutDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  DailyRate: number;

  @Column({ type: 'int' })
  TotalNights: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  SubTotal: number;

  // Relationships
  @ManyToOne(() => Reservation, (reservation) => reservation.reservationDetails)
  @JoinColumn({ name: 'ReservationID' })
  reservation: Reservation;

  // Virtual properties
  get averageNightlyRate(): number {
    return this.TotalNights > 0 ? this.SubTotal / this.TotalNights : 0;
  }

  get isValidDateRange(): boolean {
    return this.CheckOutDate > this.CheckInDate;
  }

  get totalValue(): number {
    return this.DailyRate * this.TotalNights;
  }
}
