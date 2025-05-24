// src/shared/entities/room.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Hotel } from '../../hotels/schemas/hotel.entity';
import { RoomType } from '../../room-types/schemas/room-type.entity';

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance',
  OUT_OF_ORDER = 'Out of Order',
}

@Entity('Rooms')
@Index(['HotelID', 'RoomNumber'], { unique: true })
@Index(['Status'])
@Index(['HotelID', 'Floor'])
export class Room {
  @PrimaryGeneratedColumn()
  RoomID: number;

  @Column()
  HotelID: number;

  @Column()
  RoomTypeID: number;

  @Column({ type: 'varchar', length: 20 })
  RoomNumber: string;

  @Column({ type: 'int', nullable: true })
  Floor: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  Status: RoomStatus;

  @Column({ type: 'text', nullable: true })
  SpecialNotes: string;

  @Column({ type: 'date', nullable: true })
  LastMaintenanceDate: Date;

  // Relationships
  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'HotelID' })
  hotel: Hotel;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'RoomTypeID' })
  roomType: RoomType;

  // Virtual properties
  get isAvailable(): boolean {
    return this.Status === RoomStatus.AVAILABLE;
  }

  get isOccupied(): boolean {
    return this.Status === RoomStatus.OCCUPIED;
  }

  get needsMaintenance(): boolean {
    if (!this.LastMaintenanceDate) return true;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.LastMaintenanceDate < sixMonthsAgo;
  }

  get displayName(): string {
    return `Room ${this.RoomNumber}${this.Floor ? ` (Floor ${this.Floor})` : ''}`;
  }
}
