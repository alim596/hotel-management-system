import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Hotel } from '../../hotels/schemas/hotel.entity';
import { Amenity } from './amenity.entity';

@Entity('HotelAmenities')
@Index(['HotelID', 'AmenityID'], { unique: true })
export class HotelAmenity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'HotelAmenityID' })
  HotelAmenityID: number;

  @Column()
  HotelID: number;

  @Column()
  AmenityID: number;

  @Column({ type: 'text', nullable: true })
  Details: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'time', nullable: true })
  AvailableFrom: string;

  @Column({ type: 'time', nullable: true })
  AvailableTo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  AdditionalCost: number;

  @CreateDateColumn()
  AddedDate: Date;

  @Column({ type: 'json', nullable: true })
  OperatingHours: {
    day: string;
    open: string;
    close: string;
  }[];

  // Relationships
  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'HotelID' })
  hotel: Hotel;

  @ManyToOne(() => Amenity)
  @JoinColumn({ name: 'AmenityID' })
  amenity: Amenity;

  // Virtual properties
  get isCurrentlyAvailable(): boolean {
    if (!this.AvailableFrom || !this.AvailableTo) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [fromHours, fromMinutes] = this.AvailableFrom.split(':').map(Number);
    const [toHours, toMinutes] = this.AvailableTo.split(':').map(Number);

    const fromTime = fromHours * 60 + fromMinutes;
    const toTime = toHours * 60 + toMinutes;

    return currentTime >= fromTime && currentTime <= toTime;
  }

  get formattedCost(): string | null {
    if (!this.AdditionalCost) return null;
    return `$${this.AdditionalCost.toFixed(2)}`;
  }

  get availabilityStatus(): string {
    if (!this.IsActive) return 'Unavailable';
    if (this.isCurrentlyAvailable) return 'Available Now';
    return 'Currently Closed';
  }
}
