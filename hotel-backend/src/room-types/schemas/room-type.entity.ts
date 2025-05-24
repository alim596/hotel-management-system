// src/room-types/schemas/room-type.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Hotel } from '../../hotels/schemas/hotel.entity';

@Entity('RoomTypes')
@Index(['HotelID', 'Name'])
@Index(['Capacity'])
@Index(['BasePrice'])
export class RoomType {
  @PrimaryGeneratedColumn()
  RoomTypeID: number;

  @Column()
  HotelID: number;

  @Column({ type: 'varchar', length: 100 })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'int' })
  Capacity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  BedType: string;

  @Column({ type: 'int', nullable: true })
  SizeInSqFt: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  BasePrice: number;

  @Column({ type: 'json', nullable: true })
  RoomImages: string[];

  @Column({ type: 'int', nullable: true })
  MaxOccupancy: number;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  // Relationships - simplified without reverse reference
  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'HotelID' })
  hotel: Hotel;

  // Virtual properties
  get formattedPrice(): string {
    return `${this.BasePrice.toFixed(2)}`;
  }

  get hasImages(): boolean {
    return this.RoomImages && this.RoomImages.length > 0;
  }
}
