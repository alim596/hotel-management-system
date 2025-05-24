import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';
import { Hotel } from '../../hotels/schemas/hotel.entity';
import { Reservation } from '../../bookings/schemas/reservation.entity';

@Entity('Reviews')
@Index(['HotelID', 'Rating'])
@Index(['GuestID'])
@Index(['ReviewDate'])
export class Review {
  @PrimaryGeneratedColumn()
  ReviewID: number;

  @Column()
  GuestID: number;

  @Column()
  HotelID: number;

  @Column({ nullable: true })
  ReservationID: number;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  Rating: number;

  @Column('text')
  Comment: string;

  @CreateDateColumn()
  ReviewDate: Date;

  @Column({ default: false })
  IsVerified: boolean;

  @Column({ type: 'int', default: 0 })
  HelpfulVotes: number;

  @Column({ default: true })
  IsActive: boolean;

  @Column({ type: 'text', nullable: true })
  ResponseFromHotel: string;

  @Column({ type: 'timestamp', nullable: true })
  ResponseDate: Date;

  // Relationships
  @ManyToOne(() => Guest)
  @JoinColumn({ name: 'GuestID' })
  guest: Guest;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'HotelID' })
  hotel: Hotel;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'ReservationID' })
  reservation: Reservation;

  // Virtual properties
  get ratingStars(): string {
    return '⭐'.repeat(Math.round(this.Rating));
  }

  get isResponded(): boolean {
    return !!this.ResponseFromHotel && !!this.ResponseDate;
  }

  get responseTimeInHours(): number | null {
    if (!this.ResponseDate) return null;
    const diff = this.ResponseDate.getTime() - this.ReviewDate.getTime();
    return Math.round(diff / (1000 * 60 * 60));
  }

  get isRecent(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.ReviewDate >= thirtyDaysAgo;
  }
}
